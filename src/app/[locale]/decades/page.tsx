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
					{/* Timeline line */}
					<div className="absolute left-[47px] top-0 bottom-0 w-0.5 bg-gray-300 hidden md:block" />

					{/* Decades */}
					<div className="space-y-8">
						{decades.map((decade) => {
							const stats = statsMap.get(decade.focalValue);
							return (
								<div key={decade.focalValue} className="relative">
									{/* Timeline dot (desktop only) */}
									<div className="absolute left-[35px] top-[20px] w-6 h-6 rounded-full bg-[#C60C30] border-4 border-[#FAF9F7] z-10 hidden md:block" />

									{/* Content */}
									<div className="md:ml-24">
										<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
											{/* Header with decade */}
											<div className="bg-[#C60C30] px-4 py-3">
												<h2 className="text-xl font-bold text-white">
													{decade.focalValue}
												</h2>
											</div>

											{/* Stats Grid */}
											{stats && (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
													<div className="bg-white px-4 py-3">
														<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
															{t("monarchsLabel")}
														</div>
														<div className="text-lg font-bold text-gray-900">
															{stats.monarchs}
														</div>
													</div>

													<div className="bg-white px-4 py-3">
														<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
															{t("avgWordsLabel")}
														</div>
														<div className="text-lg font-bold text-gray-900">
															{Math.round(stats.avgWords).toLocaleString(
																locale,
															)}
														</div>
													</div>
												</div>
											)}

											{/* Signature words */}
											<div className="px-4 py-4 bg-gray-50 border-t-gray-200 border-t">
												<div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
													{t("signatureWords")}
												</div>
												<p className="text-sm leading-relaxed">
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
