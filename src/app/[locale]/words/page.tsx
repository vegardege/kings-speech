import { getTranslations, setRequestLocale } from "next-intl/server";
import { WordsPageClient } from "@/components/WordsPageClient";
import { routing } from "@/i18n/routing";
import {
	getMostUsedWords,
	getTotalSpeeches,
	getWordsInMostSpeeches,
} from "@/lib/database";

interface WordsListPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export async function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function WordsListPage({ params }: WordsListPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("wordsList");
	const totalSpeeches = getTotalSpeeches();

	// Fetch data with and without stopwords
	const mostUsedWithStopwords = getMostUsedWords(20, true);
	const mostUsedWithoutStopwords = getMostUsedWords(20, false);
	const mostSpeechesWithStopwords = getWordsInMostSpeeches(20, true);
	const mostSpeechesWithoutStopwords = getWordsInMostSpeeches(20, false);

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
				<p className="text-gray-600 mb-8">{t("description")}</p>

				<WordsPageClient
					mostUsedWithStopwords={mostUsedWithStopwords}
					mostUsedWithoutStopwords={mostUsedWithoutStopwords}
					mostSpeechesWithStopwords={mostSpeechesWithStopwords}
					mostSpeechesWithoutStopwords={mostSpeechesWithoutStopwords}
					totalSpeeches={totalSpeeches}
				/>
			</div>
		</main>
	);
}
