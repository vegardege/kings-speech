import Link from "next/link";
import { YearlyCountChart } from "@/components/YearlyCountChart";
import {
	getDatabase,
	getWordCountsByYear,
	getWordTotalCount,
} from "@/lib/database";

interface WordPageProps {
	params: Promise<{
		word: string;
	}>;
}

export async function generateStaticParams() {
	const db = getDatabase();
	const words = db.prepare("SELECT DISTINCT word FROM word_count").all() as {
		word: string;
	}[];
	db.close();

	return words.map((w) => ({
		word: encodeURIComponent(w.word),
	}));
}

export default async function WordPage({ params }: WordPageProps) {
	const { word: encodedWord } = await params;
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
						← Back to search
					</Link>

					<h1 className="text-4xl font-bold text-gray-900 mb-8">{word}</h1>

					<p className="text-3xl text-gray-400 text-center py-16">
						This word was never mentioned in any speech.
					</p>
				</div>
			</main>
		);
	}

	const yearlyData = getWordCountsByYear(word, "word_count");

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-6xl">
				<Link
					href="/"
					className="text-[#C60C30] hover:underline mb-4 inline-block"
				>
					← Back to search
				</Link>

				<h1 className="text-4xl font-bold text-gray-900 mb-2">{word}</h1>
				<p className="text-gray-600 mb-8">
					Total mentions: <span className="font-semibold">{totalCount}</span>
				</p>

				<YearlyCountChart data={yearlyData} />
			</div>
		</main>
	);
}
