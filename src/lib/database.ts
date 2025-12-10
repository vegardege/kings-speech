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
