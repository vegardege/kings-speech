"use client";

import { useTranslations } from "next-intl";
import type { YearData } from "@/lib/database";

interface WordStatisticsProps {
	data: YearData[];
	totalCount: number;
	totalSpeeches: number;
}

export function WordStatistics({
	data,
	totalCount,
	totalSpeeches,
}: WordStatisticsProps) {
	const t = useTranslations("statistics");

	// Find first and last mentions
	const sortedByYear = [...data].sort((a, b) => a.year - b.year);
	const mentionedYears = sortedByYear.filter((d) => d.count > 0);

	if (mentionedYears.length === 0) {
		return null;
	}

	const firstMention = mentionedYears[0];
	const lastMention = mentionedYears[mentionedYears.length - 1];
	const isOnlyOneMention = mentionedYears.length === 1;

	// Calculate statistics
	const speechPercentage = (
		(mentionedYears.length / totalSpeeches) *
		100
	).toFixed(1);

	// Find the year with most mentions
	const yearWithMostMentions = [...data].sort((a, b) => b.count - a.count)[0];

	// Find which monarch mentioned it most (by total count)
	const monarchCounts = new Map<string, number>();
	for (const yearData of data) {
		const current = monarchCounts.get(yearData.monarch) || 0;
		monarchCounts.set(yearData.monarch, current + yearData.count);
	}
	const monarchWithMost = Array.from(monarchCounts.entries()).sort(
		(a, b) => b[1] - a[1],
	)[0];

	// Find longest streak (consecutive years mentioned)
	let currentStreak = 0;
	let longestStreak = 0;
	let longestStreakEnd = 0;
	for (let i = 0; i < sortedByYear.length; i++) {
		if (sortedByYear[i].count > 0) {
			currentStreak++;
			if (currentStreak > longestStreak) {
				longestStreak = currentStreak;
				longestStreakEnd = sortedByYear[i].year;
			}
		} else {
			currentStreak = 0;
		}
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
			{/* Total Mentions */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
					{t("totalMentions.title")}
				</div>
				<div className="text-sm text-gray-900">
					{t.rich("totalMentions.text", {
						count: totalCount,
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
				</div>
			</div>

			{/* First & Last Mention (merged) */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
					{isOnlyOneMention ? t("onlyMention.title") : t("firstAndLast.title")}
				</div>
				{isOnlyOneMention ? (
					<div className="text-sm text-gray-900">
						{t.rich("onlyMention.text", {
							year: firstMention.year,
							monarch: firstMention.monarch,
							strong: (chunks) => <strong>{chunks}</strong>,
						})}
					</div>
				) : (
					<>
						<div className="text-sm text-gray-900">
							{t.rich("firstAndLast.yearRange", {
								firstYear: firstMention.year,
								lastYear: lastMention.year,
								strong: (chunks) => <strong>{chunks}</strong>,
							})}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							{firstMention.monarch}
							{firstMention.monarch !== lastMention.monarch &&
								` → ${lastMention.monarch}`}
						</div>
					</>
				)}
			</div>

			{/* Speech Percentage */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
					{t("frequency.title")}
				</div>
				<div className="text-sm text-gray-900">
					{t.rich("frequency.percentage", {
						percentage: speechPercentage,
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
				</div>
				<div className="text-xs text-gray-500 mt-1">
					{t("frequency.speechesCount", {
						count: mentionedYears.length,
						total: totalSpeeches,
					})}
				</div>
			</div>

			{/* Most Active Year */}
			{yearWithMostMentions.count > 1 && (
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
						{t("mostActiveYear.title")}
					</div>
					<div className="text-sm text-gray-900">
						{t.rich("mostActiveYear.withMentions", {
							year: yearWithMostMentions.year,
							count: yearWithMostMentions.count,
							strong: (chunks) => <strong>{chunks}</strong>,
						})}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						{t("mostActiveYear.byMonarch", {
							monarch: yearWithMostMentions.monarch,
						})}
					</div>
				</div>
			)}

			{/* Favorite Monarch */}
			{monarchWithMost && monarchWithMost[1] > 0 && (
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
						{t("favoriteMonarch.title")}
					</div>
					<div className="text-sm text-gray-900">
						<strong>{monarchWithMost[0]}</strong>
					</div>
					<div className="text-xs text-gray-500 mt-1">
						{t("favoriteMonarch.totalMentions", {
							count: monarchWithMost[1],
						})}
					</div>
				</div>
			)}

			{/* Longest Streak */}
			{longestStreak > 2 && (
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
						{t("longestStreak.title")}
					</div>
					<div className="text-sm text-gray-900">
						{t.rich("longestStreak.consecutiveYears", {
							count: longestStreak,
							strong: (chunks) => <strong>{chunks}</strong>,
						})}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						{t("longestStreak.endingIn", { year: longestStreakEnd })}
					</div>
				</div>
			)}
		</div>
	);
}
