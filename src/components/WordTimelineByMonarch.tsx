"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { YearData } from "@/lib/database";

interface WordTimelineByMonarchProps {
	data: YearData[];
}

interface MonarchData {
	monarch: string;
	years: YearData[];
	color: string;
}

export function WordTimelineByMonarch({ data }: WordTimelineByMonarchProps) {
	const t = useTranslations("timeline");
	const [hoveredCell, setHoveredCell] = useState<YearData | null>(null);

	// Group data by monarch
	const monarchMap = new Map<string, YearData[]>();
	for (const yearData of data) {
		if (!monarchMap.has(yearData.monarch)) {
			monarchMap.set(yearData.monarch, []);
		}
		monarchMap.get(yearData.monarch)?.push(yearData);
	}

	// Single color for all monarchs (frequency shown via opacity)
	const monarchs: MonarchData[] = Array.from(monarchMap.entries()).map(
		([monarch, years]) => ({
			monarch,
			years: years.sort((a, b) => a.year - b.year),
			color: "#C60C30", // Danish red for all
		}),
	);

	// Calculate global max count across ALL monarchs for consistent color scaling
	const globalMaxCount = Math.max(...data.map((d) => d.count));

	return (
		<div className="w-full bg-white rounded-lg border border-gray-200 p-3 md:p-4">
			<div className="flex flex-col gap-3 md:gap-4">
				{monarchs.map((monarchData) => {
					return (
						<div key={monarchData.monarch} className="flex flex-col gap-1">
							<div className="flex items-center gap-2 mb-1">
								<span className="text-xs md:text-sm font-semibold text-gray-700">
									{monarchData.monarch}
								</span>
								<span className="text-[10px] md:text-xs text-gray-500">
									{monarchData.years[0].year}–
									{monarchData.years[monarchData.years.length - 1].year}
								</span>
							</div>

							<div className="overflow-x-auto -mx-3 px-3 md:overflow-x-visible md:mx-0 md:px-0">
								<div className="flex flex-wrap gap-[2px] min-w-max md:min-w-0">
									{monarchData.years.map((yearData) => {
										const hasMention = yearData.count > 0;
										const opacity = hasMention
											? globalMaxCount > 0
												? 0.4 + (yearData.count / globalMaxCount) * 0.6
												: 1
											: 1;

										return (
											<button
												type="button"
												key={yearData.year}
												className="shrink-0 w-6 h-10 md:w-[31px] md:h-[31px] rounded transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-gray-900 active:ring-2 active:ring-gray-900 relative group touch-manipulation border-0"
												style={{
													backgroundColor: hasMention
														? monarchData.color
														: "#F0F0F0",
													opacity,
												}}
												onMouseEnter={() => setHoveredCell(yearData)}
												onMouseLeave={() => setHoveredCell(null)}
												onClick={() => setHoveredCell(yearData)}
												aria-label={`${yearData.year}: ${yearData.count} mentions`}
											>
												<div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
													<div className="font-semibold">{yearData.year}</div>
													{hasMention ? (
														<div>
															{t("mentionCount", { count: yearData.count })}
														</div>
													) : (
														<div className="text-gray-300">
															{t("notMentioned")}
														</div>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-4 border-t border-gray-200">
				{hoveredCell ? (
					<div className="text-xs md:text-sm text-gray-700">
						<strong>{hoveredCell.year}</strong> ({hoveredCell.monarch}):{" "}
						{hoveredCell.count > 0 ? (
							t("mentionCount", { count: hoveredCell.count })
						) : (
							<span className="text-gray-500">{t("notMentioned")}</span>
						)}
					</div>
				) : (
					<div className="text-xs md:text-sm text-gray-500 italic">
						{t("hoverPrompt")}
					</div>
				)}
			</div>
		</div>
	);
}
