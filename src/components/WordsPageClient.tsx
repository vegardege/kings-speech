"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { WordStats } from "@/lib/database";
import { WordsTable } from "./WordsTable";

interface WordsPageClientProps {
	mostUsedWithStopwords: WordStats[];
	mostUsedWithoutStopwords: WordStats[];
	mostSpeechesWithStopwords: WordStats[];
	mostSpeechesWithoutStopwords: WordStats[];
	totalSpeeches: number;
}

export function WordsPageClient({
	mostUsedWithStopwords,
	mostUsedWithoutStopwords,
	mostSpeechesWithStopwords,
	mostSpeechesWithoutStopwords,
	totalSpeeches,
}: WordsPageClientProps) {
	const t = useTranslations("wordsList");
	const [includeStopwordsMostUsed, setIncludeStopwordsMostUsed] =
		useState(false);
	const [includeStopwordsMostSpeeches, setIncludeStopwordsMostSpeeches] =
		useState(false);

	return (
		<div className="flex flex-wrap gap-6">
			{/* Most Used Words Section */}
			<section className="flex-1 min-w-[300px]">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl md:text-2xl font-bold text-gray-900">
						{t("mostUsedTitle")}
					</h2>
					<label
						htmlFor="stopwords-toggle-most-used"
						className="flex items-center gap-2 cursor-pointer group relative"
					>
						<span className="text-xs md:text-sm font-medium text-gray-700 border-b border-dashed border-gray-400 group-hover:border-gray-600 transition-colors">
							{t("includeStopwords")}
						</span>
						<div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10 animate-in fade-in duration-200">
							<div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-lg">
								{t("stopwordsTooltip")}
								<div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
							</div>
						</div>
						<div className="relative">
							<input
								type="checkbox"
								id="stopwords-toggle-most-used"
								className="sr-only"
								checked={includeStopwordsMostUsed}
								onChange={(e) => setIncludeStopwordsMostUsed(e.target.checked)}
							/>
							<div
								className={`w-11 h-6 rounded-full transition-colors ${
									includeStopwordsMostUsed ? "bg-[#C60C30]" : "bg-gray-300"
								}`}
							>
								<div
									className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
										includeStopwordsMostUsed ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</div>
						</div>
					</label>
				</div>
				<WordsTable
					wordsWithStopwords={mostUsedWithStopwords}
					wordsWithoutStopwords={mostUsedWithoutStopwords}
					totalSpeeches={totalSpeeches}
					showColumn="totalCount"
					includeStopwords={includeStopwordsMostUsed}
				/>
			</section>

			{/* Words in Most Speeches Section */}
			<section className="flex-1 min-w-[300px]">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl md:text-2xl font-bold text-gray-900">
						{t("mostSpeechesTitle")}
					</h2>
					<label
						htmlFor="stopwords-toggle-most-speeches"
						className="flex items-center gap-2 cursor-pointer group relative"
					>
						<span className="text-xs md:text-sm font-medium text-gray-700 border-b border-dashed border-gray-400 group-hover:border-gray-600 transition-colors">
							{t("includeStopwords")}
						</span>
						<div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10 animate-in fade-in duration-200">
							<div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-lg">
								{t("stopwordsTooltip")}
								<div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
							</div>
						</div>
						<div className="relative">
							<input
								type="checkbox"
								id="stopwords-toggle-most-speeches"
								className="sr-only"
								checked={includeStopwordsMostSpeeches}
								onChange={(e) =>
									setIncludeStopwordsMostSpeeches(e.target.checked)
								}
							/>
							<div
								className={`w-11 h-6 rounded-full transition-colors ${
									includeStopwordsMostSpeeches ? "bg-[#C60C30]" : "bg-gray-300"
								}`}
							>
								<div
									className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
										includeStopwordsMostSpeeches
											? "translate-x-5"
											: "translate-x-0"
									}`}
								/>
							</div>
						</div>
					</label>
				</div>
				<WordsTable
					wordsWithStopwords={mostSpeechesWithStopwords}
					wordsWithoutStopwords={mostSpeechesWithoutStopwords}
					totalSpeeches={totalSpeeches}
					showColumn="speechCount"
					includeStopwords={includeStopwordsMostSpeeches}
				/>
			</section>
		</div>
	);
}
