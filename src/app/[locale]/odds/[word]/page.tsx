import { getTranslations, setRequestLocale } from "next-intl/server";
import { WordTimelineByDecade } from "@/components/WordTimelineByDecade";
import { WordTimelineByMonarch } from "@/components/WordTimelineByMonarch";
import {
	getDatabase,
	getWordCountsByYear,
	getWordTotalCount,
} from "@/lib/database";

interface OddsPageProps {
	params: Promise<{
		locale: string;
		word: string;
	}>;
}

// Revalidate every 24 hours (data rarely changes)
// Once generated, pages will be cached for 24h
export const revalidate = 86400;

export default async function OddsPage({ params }: OddsPageProps) {
	const { locale, word: encodedWord } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("odds");
	const word = decodeURIComponent(encodedWord);
	const totalCount = getWordTotalCount(word, "odds_count");

	if (totalCount === 0) {
		return (
			<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						{word}
						<span className="ml-3 px-3 py-1 bg-[#C60C30] text-white text-lg rounded">
							{t("badge")}
						</span>
					</h1>
					<p className="text-3xl text-gray-400 text-center py-16">
						{t("neverMentioned")}
					</p>
				</div>
			</main>
		);
	}

	const yearlyData = getWordCountsByYear(word, "odds_count");

	// Get the last year the word was mentioned
	const db = getDatabase();
	const lastMention = db
		.prepare(
			`SELECT oc.year, s.monarch
			FROM odds_count oc
			JOIN speech s ON oc.year = s.year
			WHERE oc.word = ? AND oc.count > 0
			ORDER BY oc.year DESC
			LIMIT 1`,
		)
		.get(word) as { year: number; monarch: string } | undefined;

	const currentYear = new Date().getFullYear();
	const yearsAgo = lastMention ? currentYear - lastMention.year : Infinity;
	const showChart = yearsAgo <= 5;

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					{word}
					<span className="ml-3 px-3 py-1 bg-[#C60C30] text-white text-lg rounded">
						{t("badge")}
					</span>
				</h1>
				<p className="text-gray-600 mb-8">
					{t("totalMentions")}{" "}
					<span className="font-semibold">{totalCount}</span>
				</p>

				{showChart ? (
					<>
						<div className="hidden md:block">
							<WordTimelineByMonarch data={yearlyData} />
						</div>
						<div className="md:hidden">
							<WordTimelineByDecade data={yearlyData} />
						</div>
					</>
				) : (
					lastMention && (
						<p className="text-3xl text-gray-400 text-center py-16">
							{t.rich("lastMentionedBy", {
								monarch: lastMention.monarch,
								year: lastMention.year,
								strong: (chunks) => <strong>{chunks}</strong>,
							})}
						</p>
					)
				)}
			</div>
		</main>
	);
}
