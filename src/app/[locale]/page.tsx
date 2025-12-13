import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBox } from "@/components/SearchBox";
import { getAllWordsForSearch } from "@/lib/database";

interface HomePageProps {
	params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("home");
	const words = getAllWordsForSearch();

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<p className="text-gray-700 text-3xl mt-8 mb-2">{t("header")}</p>
				<p className="text-gray-700 text-xl mt-8 mb-2">{t("subHeader")}</p>
				<SearchBox words={words} />
				<div className="mt-12 text-sm text-gray-600">
					<p>{t("searchPrompt")}</p>
				</div>
			</div>
		</main>
	);
}
