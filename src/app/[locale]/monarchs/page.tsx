import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getMonarchComparisons } from "@/lib/database";

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

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-6xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
				<p className="text-gray-600 mb-8">{t("description")}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{monarchs.map((monarch) => (
						<div
							key={monarch.focalValue}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
						>
							<h2 className="text-2xl font-bold text-[#C60C30] mb-4">
								{monarch.focalValue}
							</h2>

							<div className="mb-4">
								<p className="text-sm text-gray-600">
									{t("corpusSize", {
										size: monarch.focalCorpusSize.toLocaleString(),
									})}
								</p>
							</div>

							<div className="mb-3">
								<h3 className="text-sm font-semibold text-gray-700 mb-2">
									{t("signatureWords")}
								</h3>
								<div className="flex flex-wrap gap-2">
									{monarch.signatureWords.slice(0, 12).map((word) => (
										<Link
											key={word.word}
											href={`/word/${encodeURIComponent(word.word)}`}
											className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-[#C60C30] hover:text-white transition-colors rounded-full text-sm"
										>
											<span className="font-medium">{word.word}</span>
											<span className="ml-1.5 text-xs opacity-70">
												#{word.rank}
											</span>
										</Link>
									))}
								</div>
							</div>

							{monarch.signatureWords.length > 12 && (
								<p className="text-xs text-gray-500 mt-2">
									{t("moreWords", {
										count: monarch.signatureWords.length - 12,
									})}
								</p>
							)}
						</div>
					))}
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
