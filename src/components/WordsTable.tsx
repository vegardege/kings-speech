"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import type { WordStats } from "@/lib/database";

interface WordsTableProps {
	wordsWithStopwords: WordStats[];
	wordsWithoutStopwords: WordStats[];
	totalSpeeches: number;
	showColumn: "totalCount" | "speechCount";
	includeStopwords: boolean;
}

function toTitleCase(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function WordsTable({
	wordsWithStopwords,
	wordsWithoutStopwords,
	totalSpeeches,
	showColumn,
	includeStopwords,
}: WordsTableProps) {
	const t = useTranslations("wordsList");
	const router = useRouter();
	const [showExpanded, setShowExpanded] = useState(false);

	const words = includeStopwords ? wordsWithStopwords : wordsWithoutStopwords;
	const displayedWords = showExpanded ? words : words.slice(0, 5);

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
			<div className="overflow-x-auto">
				<table className="w-full text-sm md:text-base">
					<thead className="bg-[#C60C30] text-white">
						<tr>
							<th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold">
								{t("tableWord")}
							</th>
							<th className="px-3 md:px-6 py-3 md:py-4 text-right font-semibold">
								{showColumn === "totalCount"
									? t("tableTotalCount")
									: t("tableSpeechCount")}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{displayedWords.map((item, index) => {
							const href = `/word/${encodeURIComponent(item.word)}`;
							return (
								<tr
									key={item.word}
									className={`hover:bg-[#FFF5F5] transition-colors cursor-pointer ${
										index % 2 === 0 ? "bg-white" : "bg-gray-50"
									}`}
									onClick={() => {
										router.push(href);
									}}
								>
									<td className="px-3 md:px-6 py-3 md:py-4">
										<Link
											href={href}
											className="text-[#C60C30] hover:underline font-medium"
										>
											{toTitleCase(item.word)}
										</Link>
									</td>
									<td className="px-3 md:px-6 py-3 md:py-4 text-right text-gray-900 font-mono">
										{showColumn === "totalCount"
											? item.totalCount.toLocaleString()
											: `${item.speechCount} / ${totalSpeeches}`}
									</td>
								</tr>
							);
						})}
						{words.length > 5 && (
							<tr className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
								<td colSpan={2} className="px-3 md:px-6 py-3 md:py-4">
									<button
										type="button"
										onClick={() => setShowExpanded(!showExpanded)}
										className="w-full text-center text-sm font-medium text-gray-700 cursor-pointer"
									>
										{showExpanded ? t("showLess") : t("showMore")}
									</button>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
