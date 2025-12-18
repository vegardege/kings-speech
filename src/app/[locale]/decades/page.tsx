import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDecadeComparisons, getDecadeStats } from "@/lib/database";

interface DecadesPageProps {
	params: Promise<{
		locale: string;
	}>;
}

// Cache this page for 24 hours
export const revalidate = 86400;

export default async function DecadesPage({ params }: DecadesPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("decades");
	const decades = getDecadeComparisons();
	const decadeStats = getDecadeStats();

	// Create a map for quick lookup of stats
	const statsMap = new Map(decadeStats.map((s) => [s.decade, s]));

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
				<p className="text-gray-600 mb-12">{t("description")}</p>

				{/* Timeline */}
				<div className="relative">
					{/* Timeline line - fixed at 16px from left on mobile, 24px on desktop */}
					<div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-transparent" />

					{/* Decades */}
					<div className="space-y-10 md:space-y-14">
						{decades.map((decade) => {
							const stats = statsMap.get(decade.focalValue);
							return (
								<div
									key={decade.focalValue}
									className="relative flex items-start gap-4 md:gap-6"
								>
									{/* Timeline dot - centered on line using transform */}
									<div
										className="flex-shrink-0 relative"
										style={{ width: "32px" }}
									>
										<div className="absolute left-4 md:left-6 top-1 -translate-x-1/2 w-6 h-6 rounded-full bg-[#C60C30] border-4 border-[#FAF9F7] shadow-lg" />
									</div>

									{/* Content */}
									<div className="flex-1 pt-0.5">
										{/* Year */}
										<h2 className="text-xl md:text-2xl font-bold text-[#C60C30] mb-3 leading-none">
											{decade.focalValue}
										</h2>

										{/* Stats - stacked on separate lines */}
										{stats && (
											<div className="space-y-1 mb-3 text-sm">
												<div className="text-gray-700">
													<span className="text-xs text-gray-500">
														{t("monarchsLabel")}:{" "}
													</span>
													<span className="font-semibold">
														{stats.monarchs}
													</span>
												</div>
												<div className="text-gray-700">
													<span className="text-xs text-gray-500">
														{t("avgWordsLabel")}:{" "}
													</span>
													<span className="font-semibold">
														{Math.round(stats.avgWords).toLocaleString(locale)}
													</span>
												</div>
											</div>
										)}

										{/* Signature words */}
										<div>
											<p className="text-xs text-gray-500 mb-2">
												{t("signatureWords")}
											</p>
											<p className="text-sm leading-relaxed text-gray-700">
												{decade.signatureWords.map((word, idx) => (
													<span key={word.word}>
														<Link
															href={`/word/${encodeURIComponent(word.word)}`}
															className="text-[#C60C30] font-medium hover:text-[#A00A28] hover:underline transition-colors"
														>
															{word.word}
														</Link>
														{idx < decade.signatureWords.length - 1 && ", "}
													</span>
												))}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-3">
						{t("aboutTitle")}
					</h2>
					<p className="text-sm text-gray-600 mb-2">{t("aboutDescription")}</p>
					<p className="text-xs text-gray-500">{t("aboutMethod")}</p>
				</div>
			</div>
		</main>
	);
}
