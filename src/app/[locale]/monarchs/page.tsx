import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getMonarchComparisons, getMonarchStats } from "@/lib/database";

interface MonarchsPageProps {
	params: Promise<{
		locale: string;
	}>;
}

// Cache this page for 24 hours
export const revalidate = 86400;

export default async function MonarchsPage({ params }: MonarchsPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("monarchs");
	const monarchs = getMonarchComparisons();
	const monarchStats = getMonarchStats();

	// Create a map for quick lookup of stats
	const statsMap = new Map(monarchStats.map((s) => [s.monarch, s]));

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
				<p className="text-gray-600 mb-8">{t("description")}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{monarchs.map((monarch) => {
						const stats = statsMap.get(monarch.focalValue);
						return (
							<div
								key={monarch.focalValue}
								className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
							>
								{/* Header */}
								<div className="bg-[#C60C30] p-3">
									<h2 className="text-lg font-bold text-white">
										{monarch.focalValue}
									</h2>
								</div>

								{/* Stats Grid */}
								{stats && (
									<div className="grid grid-cols-2 gap-px bg-gray-200">
										<div className="bg-white px-4 py-3">
											<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												{t("speechCountLabel")}
											</div>
											<div className="text-lg font-bold text-gray-900">
												{stats.speechCount}
											</div>
										</div>

										<div className="bg-white px-4 py-3">
											<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												{t("yearRangeLabel")}
											</div>
											<div className="text-lg font-bold text-gray-900">
												{stats.firstYear === stats.lastYear
													? stats.firstYear
													: `${stats.firstYear}–${stats.lastYear}`}
											</div>
										</div>

										<div className="bg-white px-4 py-3">
											<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												{t("corpusSizeLabel")}
											</div>
											<div className="text-lg font-bold text-gray-900">
												{monarch.focalCorpusSize.toLocaleString(locale)}
											</div>
										</div>

										<div className="bg-white px-4 py-3">
											<div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												{t("avgWordsLabel")}
											</div>
											<div className="text-lg font-bold text-gray-900">
												{Math.round(stats.avgWords).toLocaleString(locale)}
											</div>
										</div>
									</div>
								)}

								<div className="px-4 py-3 bg-gray-50 border-t-gray-200 border-t flex-1">
									<div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
										{t("signatureWords")}
									</div>
									<p className="text-sm leading-relaxed">
										{monarch.signatureWords.map((word, index) => (
											<span key={word.word}>
												<Link
													href={`/word/${encodeURIComponent(word.word)}`}
													className="text-[#C60C30] font-medium hover:text-[#A00A28] hover:underline transition-colors"
												>
													{word.word}
												</Link>
												{index < monarch.signatureWords.length - 1 && ", "}
											</span>
										))}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
