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
	totalCount: number;
	type: "word" | "odds";
}

export function getAllWordsForSearch(): WordSearchResult[] {
	const db = getDatabase();

	// Get all words from word_count
	const wordCountResults = db
		.prepare(
			`
		SELECT word, SUM(count) as totalCount
		FROM word_count
		GROUP BY word
	`,
		)
		.all() as { word: string; totalCount: number }[];

	// Get all words from odds_count
	const oddsCountResults = db
		.prepare(
			`
		SELECT word, SUM(count) as totalCount
		FROM odds_count
		GROUP BY word
	`,
		)
		.all() as { word: string; totalCount: number }[];

	db.close();

	// Combine and mark each word with its type
	// If a word appears in both, prefer odds (since that's more specific)
	const oddsWords = new Set(oddsCountResults.map((r) => r.word));

	const results: WordSearchResult[] = [
		...oddsCountResults.map((r) => ({
			word: r.word,
			totalCount: r.totalCount,
			type: "odds" as const,
		})),
		...wordCountResults
			.filter((r) => !oddsWords.has(r.word))
			.map((r) => ({
				word: r.word,
				totalCount: r.totalCount,
				type: "word" as const,
			})),
	];

	// Sort all words together by totalCount descending
	results.sort((a, b) => b.totalCount - a.totalCount);

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
