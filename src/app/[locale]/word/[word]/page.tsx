import { getTranslations, setRequestLocale } from "next-intl/server";
import { WordStatistics } from "@/components/WordStatistics";
import { WordTimelineByDecade } from "@/components/WordTimelineByDecade";
import { WordTimelineByMonarch } from "@/components/WordTimelineByMonarch";
import { routing } from "@/i18n/routing";
import {
	getMostUsedWords,
	getTotalSpeeches,
	getWordCountsByYear,
	getWordsInMostSpeeches,
	getWordTotalCount,
} from "@/lib/database";

interface WordPageProps {
	params: Promise<{
		locale: string;
		word: string;
	}>;
}

// Pre-render the top words shown on the words list page (same queries, deduplicated)
export function generateStaticParams() {
	const words = new Set([
		...getMostUsedWords(20, true).map((w) => w.word),
		...getMostUsedWords(20, false).map((w) => w.word),
		...getWordsInMostSpeeches(20, true).map((w) => w.word),
		...getWordsInMostSpeeches(20, false).map((w) => w.word),
	]);
	return routing.locales.flatMap((locale) =>
		[...words].map((word) => ({ locale, word: encodeURIComponent(word) })),
	);
}

// ISR fallback for all other words
export const revalidate = 86400;
export const dynamicParams = true;

export default async function WordPage({ params }: WordPageProps) {
	const { locale, word: encodedWord } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("word");
	const word = decodeURIComponent(encodedWord);
	const totalCount = getWordTotalCount(word, "word_count");
	const totalSpeeches = getTotalSpeeches();

	if (totalCount === 0) {
		return (
			<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-8">{word}</h1>
					<p className="text-3xl text-gray-400 text-center py-16">
						{t("neverMentioned")}
					</p>
				</div>
			</main>
		);
	}

	const yearlyData = getWordCountsByYear(word, "word_count");

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-8 capitalize">
					{word}
				</h1>

				<div className="hidden md:block">
					<WordTimelineByMonarch data={yearlyData} />
				</div>
				<div className="md:hidden">
					<WordTimelineByDecade data={yearlyData} />
				</div>

				<WordStatistics
					data={yearlyData}
					totalCount={totalCount}
					totalSpeeches={totalSpeeches}
				/>
			</div>
		</main>
	);
}
