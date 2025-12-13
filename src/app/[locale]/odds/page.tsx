import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import { getAllOddsWords } from "@/lib/database";

interface OddsListPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export async function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function OddsListPage({ params }: OddsListPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("oddsList");
	const oddsWords = getAllOddsWords();

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
				<p className="text-gray-600 mb-8">{t("description")}</p>

				<div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-[#C60C30] text-white">
								<tr>
									<th className="px-6 py-4 text-left font-semibold">
										{t("tableWord")}
									</th>
									<th className="px-6 py-4 text-right font-semibold">
										{t("tableOdds")}
									</th>
									{oddsWords[0]?.lastFiveYears.map((yearData) => (
										<th
											key={yearData.year}
											className="px-4 py-4 text-center font-semibold"
										>
											{yearData.year}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{oddsWords.map((item, index) => {
									const recentYears = item.lastFiveYears.map((y) => y.year);
									const isRecent =
										item.lastMentioned !== null &&
										recentYears.includes(item.lastMentioned);

									return (
										<tr
											key={item.word}
											className={`hover:bg-gray-50 transition-colors ${
												index % 2 === 0 ? "bg-white" : "bg-gray-50"
											}`}
										>
											<td className="px-6 py-4">
												<Link
													href={`/odds/${encodeURIComponent(item.word)}`}
													className="text-[#C60C30] hover:underline font-medium"
												>
													{item.word}
												</Link>
											</td>
											<td className="px-6 py-4 text-right text-gray-900 font-mono">
												{item.odds.toFixed(2)}
											</td>
											{item.lastMentioned === null ? (
												<td
													colSpan={5}
													className="px-6 py-4 text-center text-gray-600 text-sm"
												>
													{t("never")}
												</td>
											) : isRecent ? (
												item.lastFiveYears.map((yearData) => (
													<td
														key={yearData.year}
														className="px-4 py-4 text-center"
													>
														{yearData.mentioned ? (
															<span
																role="img"
																className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700"
																aria-label={t("mentioned")}
															>
																<svg
																	className="w-4 h-4"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<title>{t("mentioned")}</title>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M5 13l4 4L19 7"
																	/>
																</svg>
															</span>
														) : (
															<span
																role="img"
																className="inline-flex items-center justify-center w-6 h-6 text-gray-300"
																aria-label={t("notMentioned")}
															>
																<svg
																	className="w-4 h-4"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<title>{t("notMentioned")}</title>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M6 18L18 6M6 6l12 12"
																	/>
																</svg>
															</span>
														)}
													</td>
												))
											) : (
												<td
													colSpan={5}
													className="px-6 py-4 text-center text-gray-600 text-sm"
												>
													{t.rich("lastMentionedBy", {
														monarch: item.lastMentionedMonarch ?? "",
														year: item.lastMentioned,
														strong: (chunks) => <strong>{chunks}</strong>,
													})}
												</td>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				<div className="md:hidden space-y-4">
					{oddsWords.map((item) => {
						const recentYears = item.lastFiveYears.map((y) => y.year);
						const isRecent =
							item.lastMentioned !== null &&
							recentYears.includes(item.lastMentioned);

						return (
							<div
								key={item.word}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
							>
								<div className="flex items-start justify-between mb-5">
									<Link
										href={`/odds/${encodeURIComponent(item.word)}`}
										className="text-[#C60C30] hover:underline font-medium text-lg flex-1"
									>
										{item.word}
									</Link>
									<span className="ml-3 px-3 py-1 bg-[#C60C30] text-white font-mono text-sm rounded">
										{item.odds.toFixed(2)}
									</span>
								</div>

								{item.lastMentioned === null ? (
									<div className="text-sm text-gray-600">{t("never")}</div>
								) : isRecent ? (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											{item.lastFiveYears.map((yearData) => (
												<div
													key={yearData.year}
													className="flex flex-col items-center gap-1"
												>
													<span className="text-xs font-medium text-gray-700">
														{yearData.year}
													</span>
													{yearData.mentioned ? (
														<span
															role="img"
															className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700"
															aria-label={t("mentioned")}
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<title>{t("mentioned")}</title>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														</span>
													) : (
														<span
															role="img"
															className="inline-flex items-center justify-center w-6 h-6 text-gray-300"
															aria-label={t("notMentioned")}
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<title>{t("notMentioned")}</title>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
														</span>
													)}
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-sm text-gray-600">
										{t.rich("lastMentionedBy", {
											monarch: item.lastMentionedMonarch ?? "",
											year: item.lastMentioned,
											strong: (chunks) => <strong>{chunks}</strong>,
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="mt-6 text-sm text-gray-600">
					<p>{t("oddsExplanation")}</p>
				</div>
			</div>
		</main>
	);
}
