import Link from "next/link";
import { getDatabase } from "@/lib/database";

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
		word: w.word,
	}));
}

export default async function WordPage({ params }: WordPageProps) {
	const { word } = await params;

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<Link
					href="/"
					className="text-[#C60C30] hover:underline mb-4 inline-block"
				>
					← Back to search
				</Link>

				<h1 className="text-4xl font-bold text-gray-900 mb-4">{word}</h1>

				<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
					<p className="text-gray-600">
						Statistics and usage patterns for this word will be displayed here.
					</p>
				</div>
			</div>
		</main>
	);
}
