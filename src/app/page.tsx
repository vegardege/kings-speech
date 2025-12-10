import { SearchBox } from "@/components/SearchBox";
import { getAllWordsForSearch } from "@/lib/database";

export default function HomePage() {
	const words = getAllWordsForSearch();

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-[#C60C30] mb-4">
					King's Speech
				</h1>
				<p className="text-gray-700 mb-8">
					Statistics and analysis of the Danish Monarch's New Year's Eve
					speeches
				</p>

				<div className="my-12">
					<SearchBox words={words} />
				</div>

				<div className="mt-12 text-sm text-gray-600">
					<p>
						Search for any word to see its usage across the years, or explore
						the odds for commonly bet-upon words.
					</p>
				</div>
			</div>
		</main>
	);
}
