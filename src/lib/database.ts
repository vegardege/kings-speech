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
