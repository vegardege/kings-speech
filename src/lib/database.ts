import { homedir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { cache } from "react";

function getDatabasePath(): string {
	const xdgDataHome = process.env.XDG_DATA_HOME;
	if (xdgDataHome) {
		return join(xdgDataHome, "royal-pipes", "analytics.db");
	}
	return join(homedir(), ".local", "share", "royal-pipes", "analytics.db");
}

// Singleton database connection for better performance
// SQLite handles concurrent reads well, so we can reuse the connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
	if (!db) {
		const dbPath = getDatabasePath();
		db = new Database(dbPath, { readonly: true });
	}
	return db;
}

export interface WordSearchResult {
	word: string;
	speechCount: number;
	speechPercentage: number;
	isStopword: boolean;
	type: "word" | "odds";
}

export const getAllWordsForSearch = cache((): WordSearchResult[] => {
	const db = getDatabase();

	const totalSpeeches = (
		db.prepare("SELECT COUNT(*) as count FROM speech").get() as {
			count: number;
		}
	).count;

	const wordCountResults = db
		.prepare(
			`
  		SELECT word, is_stopword AS isStopword, COUNT(DISTINCT year) as speechCount
  		FROM word_count
  		WHERE count > 0
  		GROUP BY word, is_stopword
  	`,
		)
		.all() as { word: string; isStopword: boolean; speechCount: number }[];

	const oddsCountResults = db
		.prepare(
			`
  		SELECT word, COUNT(DISTINCT year) as speechCount
  		FROM odds_count
  		WHERE count > 0
  		GROUP BY word
  	`,
		)
		.all() as { word: string; speechCount: number }[];

	const results: WordSearchResult[] = [
		...wordCountResults.map((r) => ({
			word: r.word,
			isStopword: r.isStopword,
			speechCount: r.speechCount,
			speechPercentage: (r.speechCount / totalSpeeches) * 100,
			type: "word" as const,
		})),
		...oddsCountResults.map((r) => ({
			word: r.word,
			isStopword: false,
			speechCount: r.speechCount,
			speechPercentage: (r.speechCount / totalSpeeches) * 100,
			type: "odds" as const,
		})),
	];

	results.sort(
		(a, b) =>
			b.speechCount - a.speechCount ||
			a.word.localeCompare(b.word, undefined, { sensitivity: "base" }),
	);

	return results;
});

export interface YearData {
	year: number;
	count: number;
	monarch: string;
}

export const getWordCountsByYear = cache(
	(word: string, table: "word_count" | "odds_count"): YearData[] => {
		const db = getDatabase();

		const speeches = db
			.prepare("SELECT year, monarch FROM speech ORDER BY year")
			.all() as { year: number; monarch: string }[];

		const counts = db
			.prepare(`SELECT year, count FROM ${table} WHERE word = ?`)
			.all(word) as { year: number; count: number }[];

		const countMap = new Map(counts.map((c) => [c.year, c.count]));

		return speeches.map((s) => ({
			year: s.year,
			count: countMap.get(s.year) ?? 0,
			monarch: s.monarch,
		}));
	},
);

export const getWordTotalCount = cache(
	(word: string, table: "word_count" | "odds_count"): number => {
		const db = getDatabase();
		const result = db
			.prepare(`SELECT SUM(count) as total FROM ${table} WHERE word = ?`)
			.get(word) as { total: number | null };
		return result.total ?? 0;
	},
);

export interface OddsWord {
	word: string;
	odds: number;
	lastMentioned: number | null;
	lastMentionedMonarch: string | null;
	lastFiveYears: { year: number; mentioned: boolean }[];
}

export const getTotalSpeeches = cache((): number => {
	const db = getDatabase();
	const result = db.prepare("SELECT COUNT(*) as count FROM speech").get() as {
		count: number;
	};
	return result.count;
});

export const getAllOddsWords = cache((): OddsWord[] => {
	const db = getDatabase();

	const years = db
		.prepare("SELECT DISTINCT year FROM speech ORDER BY year DESC LIMIT 5")
		.all() as { year: number }[];

	const oddsWords = db
		.prepare("SELECT word, odds FROM odds ORDER BY odds ASC")
		.all() as { word: string; odds: number }[];

	const results: OddsWord[] = oddsWords.map((oddsWord) => {
		const lastMentionedResult = db
			.prepare(
				`
				SELECT oc.year, s.monarch
				FROM odds_count oc
				JOIN speech s ON oc.year = s.year
				WHERE oc.word = ? AND oc.count > 0
				ORDER BY oc.year DESC
				LIMIT 1
				`,
			)
			.get(oddsWord.word) as { year: number; monarch: string } | undefined;

		const lastFiveYears = years.map((y) => {
			const count = db
				.prepare("SELECT count FROM odds_count WHERE word = ? AND year = ?")
				.get(oddsWord.word, y.year) as { count: number } | undefined;

			return {
				year: y.year,
				mentioned: (count?.count ?? 0) > 0,
			};
		});

		return {
			word: oddsWord.word,
			odds: oddsWord.odds,
			lastMentioned: lastMentionedResult?.year ?? null,
			lastMentionedMonarch: lastMentionedResult?.monarch ?? null,
			lastFiveYears,
		};
	});

	return results;
});

export interface WordStats {
	word: string;
	totalCount: number;
	speechCount: number;
	isStopword: boolean;
}

export const getMostUsedWords = cache(
	(limit: number, includeStopwords: boolean): WordStats[] => {
		const db = getDatabase();

		const stopwordFilter = includeStopwords ? "" : "WHERE is_stopword = 0";

		const results = db
			.prepare(
				`
			SELECT
				word,
				SUM(count) as totalCount,
				COUNT(DISTINCT year) as speechCount,
				is_stopword as isStopword
			FROM word_count
			${stopwordFilter}
			GROUP BY word, is_stopword
			ORDER BY totalCount DESC, speechCount DESC, word ASC
			LIMIT ?
		`,
			)
			.all(limit) as {
			word: string;
			totalCount: number;
			speechCount: number;
			isStopword: number;
		}[];

		return results.map((r) => ({
			...r,
			isStopword: r.isStopword === 1,
		}));
	},
);

export const getWordsInMostSpeeches = cache(
	(limit: number, includeStopwords: boolean): WordStats[] => {
		const db = getDatabase();

		const stopwordFilter = includeStopwords ? "" : "WHERE is_stopword = 0";

		const results = db
			.prepare(
				`
			SELECT
				word,
				SUM(count) as totalCount,
				COUNT(DISTINCT year) as speechCount,
				is_stopword as isStopword
			FROM word_count
			${stopwordFilter}
			GROUP BY word, is_stopword
			ORDER BY speechCount DESC, totalCount DESC, word ASC
			LIMIT ?
		`,
			)
			.all(limit) as {
			word: string;
			totalCount: number;
			speechCount: number;
			isStopword: number;
		}[];

		return results.map((r) => ({
			...r,
			isStopword: r.isStopword === 1,
		}));
	},
);

export interface SignatureWord {
	word: string;
	rank: number;
	wloScore: number;
	focalCount: number;
	backgroundCount: number;
	focalRate: number;
	backgroundRate: number;
	zScore: number;
}

export interface WLOComparison {
	comparisonId: number;
	comparisonType: string;
	focalValue: string;
	backgroundType: string;
	alpha: number;
	focalCorpusSize: number;
	backgroundCorpusSize: number;
	signatureWords: SignatureWord[];
}

export const getDecadeComparisons = cache((): WLOComparison[] => {
	const db = getDatabase();

	const comparisons = db
		.prepare(
			`
			SELECT
				comparison_id as comparisonId,
				comparison_type as comparisonType,
				focal_value as focalValue,
				background_type as backgroundType,
				alpha,
				focal_corpus_size as focalCorpusSize,
				background_corpus_size as backgroundCorpusSize
			FROM wlo_comparisons
			WHERE comparison_type = 'decade'
			ORDER BY focal_value ASC
		`,
		)
		.all() as Omit<WLOComparison, "signatureWords">[];

	return comparisons.map((comparison) => {
		const words = db
			.prepare(
				`
				SELECT
					word,
					rank,
					wlo_score as wloScore,
					focal_count as focalCount,
					background_count as backgroundCount,
					focal_rate as focalRate,
					background_rate as backgroundRate,
					z_score as zScore
				FROM wlo_words
				WHERE comparison_id = ?
				ORDER BY rank ASC
			`,
			)
			.all(comparison.comparisonId) as SignatureWord[];

		return {
			...comparison,
			signatureWords: words,
		};
	});
});

export interface MonarchStats {
	monarch: string;
	speechCount: number;
	firstYear: number;
	lastYear: number;
	avgWords: number;
}

export const getMonarchStats = cache((): MonarchStats[] => {
	const db = getDatabase();

	const stats = db
		.prepare(
			`
			SELECT
				s.monarch,
				COUNT(DISTINCT s.year) as speechCount,
				MIN(s.year) as firstYear,
				MAX(s.year) as lastYear,
				AVG(wc.total_words) as avgWords
			FROM speech s
			LEFT JOIN (
				SELECT year, SUM(count) as total_words
				FROM word_count
				GROUP BY year
			) wc ON s.year = wc.year
			GROUP BY s.monarch
			ORDER BY firstYear
		`,
		)
		.all() as MonarchStats[];

	return stats;
});

export interface DecadeStats {
	decade: string;
	monarchs: string;
	avgWords: number;
}

export const getDecadeStats = cache((): DecadeStats[] => {
	const db = getDatabase();

	// First, get the basic stats for each decade
	const rawStats = db
		.prepare(
			`
			SELECT
				CASE
					WHEN s.year < 1950 THEN '1940s'
					WHEN s.year < 1960 THEN '1950s'
					WHEN s.year < 1970 THEN '1960s'
					WHEN s.year < 1980 THEN '1970s'
					WHEN s.year < 1990 THEN '1980s'
					WHEN s.year < 2000 THEN '1990s'
					WHEN s.year < 2010 THEN '2000s'
					WHEN s.year < 2020 THEN '2010s'
					ELSE '2020s'
				END as decade,
				AVG(wc.total_words) as avgWords,
				MIN(s.year) as firstYear
			FROM speech s
			LEFT JOIN (
				SELECT year, SUM(count) as total_words
				FROM word_count
				GROUP BY year
			) wc ON s.year = wc.year
			GROUP BY decade
			ORDER BY firstYear
		`,
		)
		.all() as Array<{ decade: string; avgWords: number; firstYear: number }>;

	// For each decade, get the distinct monarchs
	const stats = rawStats.map((stat) => {
		const monarchList = db
			.prepare(
				`
				SELECT monarch, MIN(year) as firstYear
				FROM speech
				WHERE CASE
					WHEN year < 1950 THEN '1940s'
					WHEN year < 1960 THEN '1950s'
					WHEN year < 1970 THEN '1960s'
					WHEN year < 1980 THEN '1970s'
					WHEN year < 1990 THEN '1980s'
					WHEN year < 2000 THEN '1990s'
					WHEN year < 2010 THEN '2000s'
					WHEN year < 2020 THEN '2010s'
					ELSE '2020s'
				END = ?
				GROUP BY monarch
				ORDER BY firstYear
			`,
			)
			.all(stat.decade) as Array<{ monarch: string; firstYear: number }>;

		return {
			decade: stat.decade,
			monarchs: monarchList.map((m) => m.monarch).join(", "),
			avgWords: stat.avgWords,
		};
	});

	return stats;
});

export const getMonarchComparisons = cache((): WLOComparison[] => {
	const db = getDatabase();

	const comparisons = db
		.prepare(
			`
			SELECT
				comparison_id as comparisonId,
				comparison_type as comparisonType,
				focal_value as focalValue,
				background_type as backgroundType,
				alpha,
				focal_corpus_size as focalCorpusSize,
				background_corpus_size as backgroundCorpusSize
			FROM wlo_comparisons
			WHERE comparison_type = 'monarch'
			ORDER BY
				CASE focal_value
					WHEN 'Christian X' THEN 1
					WHEN 'Frederik IX' THEN 2
					WHEN 'Margrethe II' THEN 3
					WHEN 'Frederik X' THEN 4
				END
		`,
		)
		.all() as Omit<WLOComparison, "signatureWords">[];

	return comparisons.map((comparison) => {
		const words = db
			.prepare(
				`
				SELECT
					word,
					rank,
					wlo_score as wloScore,
					focal_count as focalCount,
					background_count as backgroundCount,
					focal_rate as focalRate,
					background_rate as backgroundRate,
					z_score as zScore
				FROM wlo_words
				WHERE comparison_id = ?
				ORDER BY rank ASC
			`,
			)
			.all(comparison.comparisonId) as SignatureWord[];

		return {
			...comparison,
			signatureWords: words,
		};
	});
});
