import type { SpeechData } from "@/lib/database";

interface SpeechesPageClientProps {
	speeches: SpeechData[];
	locale: string;
	translations: {
		title: string;
		description: string;
		words: string;
		aboutTitle: string;
		aboutDescription: string;
	};
}

export function SpeechesPageClient({
	speeches,
	locale,
	translations,
}: SpeechesPageClientProps) {
	// Find the maximum word count for scaling the bars
	const maxWordCount = Math.max(...speeches.map((s) => s.wordCount));

	// Group speeches by monarch
	const groupedSpeeches = speeches.reduce(
		(acc, speech) => {
			if (!acc[speech.monarch]) {
				acc[speech.monarch] = [];
			}
			acc[speech.monarch].push(speech);
			return acc;
		},
		{} as Record<string, typeof speeches>,
	);

	return (
		<main className="min-h-screen bg-[#FAF9F7] px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					{translations.title}
				</h1>
				<p className="text-gray-600 mb-12">{translations.description}</p>

				{/* Monarchs and their timelines */}
				<div className="space-y-12">
					{Object.entries(groupedSpeeches).map(([monarch, monarchSpeeches]) => (
						<div key={monarch}>
							{/* Monarch header - outside timeline */}
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								{monarch}
							</h2>

							{/* Timeline for this monarch */}
							<div className="relative">
								{/* Timeline line */}
								<div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-transparent" />

								{/* Year entries */}
								<div className="space-y-6">
									{monarchSpeeches.map((speech) => (
										<div
											key={speech.year}
											className="relative flex items-start gap-4 md:gap-6"
										>
											{/* Timeline dot */}
											<div
												className="flex-shrink-0 relative"
												style={{ width: "32px" }}
											>
												<div className="absolute left-4 md:left-6 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full bg-[#C60C30] border-4 border-[#FAF9F7] shadow-lg" />
											</div>

											{/* Content */}
											<div className="flex-1 pt-0.5">
												{/* Year and word count */}
												<div className="flex items-baseline justify-between mb-2">
													<h3 className="text-lg md:text-xl font-bold text-[#C60C30] leading-none">
														{speech.year}
													</h3>
													<span className="text-sm text-gray-600">
														{speech.wordCount.toLocaleString(locale)}{" "}
														{translations.words}
													</span>
												</div>

												{/* Word count bar */}
												<div className="mb-3">
													<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-[#C60C30] transition-all"
															style={{
																width: `${(speech.wordCount / maxWordCount) * 100}%`,
															}}
														/>
													</div>
												</div>

												{/* Significant events */}
												{speech.significantEvents.length > 0 && (
													<div className="flex flex-wrap gap-2">
														{speech.significantEvents.map((event) => (
															<span
																key={event.event}
																className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 border border-gray-200"
															>
																{event.event}
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-3">
						{translations.aboutTitle}
					</h2>
					<p className="text-sm text-gray-600">
						{translations.aboutDescription}
					</p>
				</div>
			</div>
		</main>
	);
}
