import { getTranslations, setRequestLocale } from "next-intl/server";
import { YearlyCountChart } from "@/components/YearlyCountChart";
import { Link, routing } from "@/i18n/routing";
import {
	getDatabase,
	getWordCountsByYear,
	getWordTotalCount,
} from "@/lib/database";

interface WordPageProps {
	params: Promise<{
		locale: string;
		word: string;
	}>;
}

export async function generateStaticParams() {
	const db = getDatabase();
	const words = db.prepare("SELECT DISTINCT word FROM word_count").all() as {
		word: string;
	}[];
	db.close();

	// Generate params for each locale and each word
	const params = [];
	for (const locale of routing.locales) {
		for (const w of words) {
			params.push({
				locale,
				word: encodeURIComponent(w.word),
			});
		}
	}

	return params;
}

export default async function WordPage({ params }: WordPageProps) {
	const { locale, word: encodedWord } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("word");
	const word = decodeURIComponent(encodedWord);
	const totalCount = getWordTotalCount(word, "word_count");

	if (totalCount === 0) {
		return (
			<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<Link
						href="/"
						className="text-[#C60C30] hover:underline mb-4 inline-block"
					>
						{t("backToSearch")}
					</Link>

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
				<Link
					href="/"
					className="text-[#C60C30] hover:underline mb-4 inline-block"
				>
					{t("backToSearch")}
				</Link>

				<h1 className="text-4xl font-bold text-gray-900 mb-2">{word}</h1>
				<p className="text-gray-600 mb-8">
					{t("totalMentions")}{" "}
					<span className="font-semibold">{totalCount}</span>
				</p>

				<YearlyCountChart data={yearlyData} />
			</div>
		</main>
	);
}
