import { getTranslations, setRequestLocale } from "next-intl/server";
import { EntitiesTable } from "@/components/EntitiesTable";
import { WordsPageClient } from "@/components/WordsPageClient";
import {
	getMostUsedEntities,
	getMostUsedWords,
	getTotalSpeeches,
	getWordsInMostSpeeches,
} from "@/lib/database";

interface WordsListPageProps {
	params: Promise<{
		locale: string;
	}>;
}

// Cache this page for 24 hours
export const revalidate = 86400;

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

	// Fetch persons and places data
	const mostUsedPersons = getMostUsedEntities(20, "person_count");
	const mostUsedPlaces = getMostUsedEntities(20, "place_count");

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

				{/* Persons & Places Section */}
				<div className="mt-12 flex flex-wrap gap-6">
					<section className="flex-1 min-w-[300px]">
						<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
							{t("personsTitle")}
						</h2>
						<EntitiesTable
							entities={mostUsedPersons}
							totalSpeeches={totalSpeeches}
							showColumn="totalCount"
							translationNamespace="wordsList"
						/>
					</section>

					<section className="flex-1 min-w-[300px]">
						<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
							{t("placesTitle")}
						</h2>
						<EntitiesTable
							entities={mostUsedPlaces}
							totalSpeeches={totalSpeeches}
							showColumn="totalCount"
							translationNamespace="wordsList"
						/>
					</section>
				</div>
			</div>
		</main>
	);
}
