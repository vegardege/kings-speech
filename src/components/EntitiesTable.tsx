"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { EntityStats } from "@/lib/database";

interface EntitiesTableProps {
	entities: EntityStats[];
	totalSpeeches: number;
	showColumn: "totalCount" | "speechCount";
	translationNamespace: string;
}

export function EntitiesTable({
	entities,
	totalSpeeches,
	showColumn,
	translationNamespace,
}: EntitiesTableProps) {
	const t = useTranslations(translationNamespace);
	const [showExpanded, setShowExpanded] = useState(false);

	const displayedEntities = showExpanded ? entities : entities.slice(0, 5);

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
			<div className="overflow-x-auto">
				<table className="w-full text-sm md:text-base">
					<thead className="bg-[#C60C30] text-white">
						<tr>
							<th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold">
								{t("tableEntity")}
							</th>
							<th className="px-3 md:px-6 py-3 md:py-4 text-right font-semibold">
								{showColumn === "totalCount"
									? t("tableTotalCount")
									: t("tableSpeechCount")}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{displayedEntities.map((item, index) => {
							return (
								<tr
									key={item.entity}
									className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
								>
									<td className="px-3 md:px-6 py-3 md:py-4">
										<span className="text-gray-900 font-medium">
											{item.entity}
										</span>
									</td>
									<td className="px-3 md:px-6 py-3 md:py-4 text-right text-gray-900 font-mono">
										{showColumn === "totalCount"
											? item.totalCount.toLocaleString()
											: `${item.speechCount} / ${totalSpeeches}`}
									</td>
								</tr>
							);
						})}
						{entities.length > 5 && (
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
