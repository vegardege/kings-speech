"use client";

import { useState } from "react";
import type { YearData } from "@/lib/database";

interface WordTimelineByDecadeProps {
	data: YearData[];
}

interface DecadeData {
	decade: number;
	years: (YearData | null)[];
}

export function WordTimelineByDecade({ data }: WordTimelineByDecadeProps) {
	const [hoveredCell, setHoveredCell] = useState<YearData | null>(null);

	// Organize all data into decades
	const minYear = Math.min(...data.map((d) => d.year));
	const maxYear = Math.max(...data.map((d) => d.year));
	const minDecade = Math.floor(minYear / 10) * 10;
	const maxDecade = Math.floor(maxYear / 10) * 10;

	const dataMap = new Map(data.map((d) => [d.year, d]));

	const decades: DecadeData[] = [];
	for (let decade = minDecade; decade <= maxDecade; decade += 10) {
		const years: (YearData | null)[] = [];
		for (let i = 0; i < 10; i++) {
			const year = decade + i;
			years.push(dataMap.get(year) || null);
		}
		decades.push({ decade, years });
	}

	const getMaxCount = () => Math.max(...data.map((d) => d.count));
	const maxCount = getMaxCount();

	return (
		<div className="w-full bg-white rounded-lg border border-gray-200 p-3 md:p-4">
			<div className="flex flex-col gap-2">
				{decades.map((decadeData) => {
					return (
						<div key={decadeData.decade} className="flex items-center gap-2">
							<div className="w-12 text-xs font-medium text-gray-600 shrink-0">
								{decadeData.decade}s
							</div>

							<div className="flex gap-[3px] flex-1">
								{decadeData.years.map((yearData, idx) => {
									const year = decadeData.decade + idx;
									const hasMention = yearData && yearData.count > 0;
									const opacity =
										hasMention && maxCount > 0
											? 0.4 + (yearData.count / maxCount) * 0.6
											: 1;

									// Determine background: transparent if no speech, gray if speech but no mention, red if mentioned
									let backgroundColor = "transparent";
									if (yearData) {
										backgroundColor = hasMention ? "#C60C30" : "#F0F0F0";
									}

									return (
										<button
											key={year}
											type="button"
											className="flex-1 aspect-square min-w-[16px] max-w-[32px] rounded transition-all duration-150 hover:ring-2 hover:ring-gray-900 active:ring-2 active:ring-gray-900 relative group border-0 cursor-pointer"
											style={{
												backgroundColor,
												opacity,
											}}
											onMouseEnter={() => yearData && setHoveredCell(yearData)}
											onMouseLeave={() => setHoveredCell(null)}
											onClick={() => yearData && setHoveredCell(yearData)}
											aria-label={
												yearData
													? `${year}: ${yearData.count} mentions`
													: `${year}: No data`
											}
										>
											{yearData && (
												<div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
													<div className="font-semibold">{year}</div>
													<div className="text-gray-300 text-[10px]">
														{yearData.monarch}
													</div>
													{hasMention ? (
														<div>
															{yearData.count} mention
															{yearData.count !== 1 ? "s" : ""}
														</div>
													) : (
														<div className="text-gray-400">Not mentioned</div>
													)}
												</div>
											)}
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{hoveredCell ? (
				<div className="mt-2 text-xs text-gray-700">
					<strong>{hoveredCell.year}</strong> ({hoveredCell.monarch}):{" "}
					{hoveredCell.count > 0 ? (
						<>
							{hoveredCell.count} mention{hoveredCell.count !== 1 ? "s" : ""}
						</>
					) : (
						<span className="text-gray-500">Not mentioned</span>
					)}
				</div>
			) : (
				<div className="mt-2 text-xs text-gray-500 italic">
					Hover/tap a year to see details
				</div>
			)}
		</div>
	);
}
