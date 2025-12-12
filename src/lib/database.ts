import { homedir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";

function getDatabasePath(): string {
	const xdgDataHome = process.env.XDG_DATA_HOME;
	if (xdgDataHome) {
		return join(xdgDataHome, "royal-pipes", "analytics.db");
	}
	return join(homedir(), ".local", "share", "royal-pipes", "analytics.db");
}

export function getDatabase() {
	const dbPath = getDatabasePath();
	return new Database(dbPath, { readonly: true });
}

export interface WordSearchResult {
	word: string;
	speechCount: number;
	speechPercentage: number;
	isStopword: boolean;
	type: "word" | "odds";
}

export function getAllWordsForSearch(): WordSearchResult[] {
	const db = getDatabase();

	// Get total number of speeches
	const totalSpeeches = (
		db.prepare("SELECT COUNT(*) as count FROM speech").get() as {
			count: number;
		}
	).count;

	// Get all words from word_count with number of speeches they appear in
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

	// Get all words from odds_count with number of speeches they appear in
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

	db.close();

	// Combine and mark each word with its type
	// If a word appears in both, prefer odds (since that's more specific)
	const oddsWords = new Set(oddsCountResults.map((r) => r.word));

	const results: WordSearchResult[] = [
		...wordCountResults
			.filter((r) => !oddsWords.has(r.word))
			.map((r) => ({
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

	// Sort all words together by speechCount descending
	results.sort(
		(a, b) =>
			b.speechCount - a.speechCount ||
			a.word.localeCompare(b.word, undefined, { sensitivity: "base" }),
	);

	return results;
}

export interface YearData {
	year: number;
	count: number;
	monarch: string;
}

export function getWordCountsByYear(
	word: string,
	table: "word_count" | "odds_count",
): YearData[] {
	const db = getDatabase();

	// Get all speeches with monarch info
	const speeches = db
		.prepare("SELECT year, monarch FROM speech ORDER BY year")
		.all() as { year: number; monarch: string }[];

	// Get word counts for this specific word
	const counts = db
		.prepare(`SELECT year, count FROM ${table} WHERE word = ?`)
		.all(word) as { year: number; count: number }[];

	db.close();

	// Create a map of year -> count
	const countMap = new Map(counts.map((c) => [c.year, c.count]));

	// Combine: all years from speeches, with counts (0 if not present)
	return speeches.map((s) => ({
		year: s.year,
		count: countMap.get(s.year) ?? 0,
		monarch: s.monarch,
	}));
}

export function getWordTotalCount(
	word: string,
	table: "word_count" | "odds_count",
): number {
	const db = getDatabase();
	const result = db
		.prepare(`SELECT SUM(count) as total FROM ${table} WHERE word = ?`)
		.get(word) as { total: number | null };
	db.close();
	return result.total ?? 0;
}

export interface OddsWord {
	word: string;
	odds: number;
	lastMentioned: number | null;
	lastMentionedMonarch: string | null;
	lastFiveYears: { year: number; mentioned: boolean }[];
}

export function getAllOddsWords(): OddsWord[] {
	const db = getDatabase();

	// Get the last 5 years with speeches
	const years = db
		.prepare("SELECT DISTINCT year FROM speech ORDER BY year DESC LIMIT 5")
		.all() as { year: number }[];

	// Get all odds words
	const oddsWords = db
		.prepare("SELECT word, odds FROM odds ORDER BY odds ASC")
		.all() as { word: string; odds: number }[];

	// For each word, check if it was mentioned in each of the last 5 years
	const results: OddsWord[] = oddsWords.map((oddsWord) => {
		// Find the most recent year this word was mentioned
		const lastMentionedResult = db
			.prepare(
				`SELECT oc.year, s.monarch
				FROM odds_count oc
				JOIN speech s ON oc.year = s.year
				WHERE oc.word = ? AND oc.count > 0
				ORDER BY oc.year DESC
				LIMIT 1`,
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

	db.close();
	return results;
}
