"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import type { WordSearchResult } from "@/lib/database";
import { LanguageToggle } from "./LanguageToggle";
import { SearchBox } from "./SearchBox";

interface TopMenuBarProps {
	words: WordSearchResult[];
}

export function TopMenuBar({ words }: TopMenuBarProps) {
	const t = useTranslations("navigation");
	const [searchExpanded, setSearchExpanded] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			<div className="bg-[#C60C30] sticky top-0 z-50 px-4">
				<div className="mx-auto max-w-4xl">
					<div className="flex items-center h-16 gap-4 relative">
						<div className="hidden md:flex items-center gap-6 flex-1">
							<Link
								href="/"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("home")}
							</Link>
							<Link
								href="/words"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("words")}
							</Link>
							<Link
								href="/odds"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("odds")}
							</Link>
							<Link
								href="/speeches"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("speeches")}
							</Link>
							<Link
								href="/decades"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("decades")}
							</Link>
							<Link
								href="/monarchs"
								className="text-white font-medium hover:opacity-80 transition-opacity"
							>
								{t("monarchs")}
							</Link>
						</div>

						<div className="hidden md:flex items-center gap-4">
							{!searchExpanded && (
								<>
									<LanguageToggle />
									<button
										type="button"
										onClick={() => setSearchExpanded(true)}
										className="text-white hover:opacity-80 transition-opacity p-2"
										aria-label={t("search")}
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>{t("search")}</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</button>
								</>
							)}
						</div>

						<div className="flex md:hidden items-center gap-4 ml-auto">
							{!searchExpanded && (
								<>
									<button
										type="button"
										onClick={() => setSearchExpanded(true)}
										className="text-white hover:opacity-80 transition-opacity p-2"
										aria-label={t("search")}
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>{t("search")}</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</button>
									<button
										type="button"
										onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
										className="text-white hover:opacity-80 transition-opacity p-2"
										aria-label={t("menu")}
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>{t("menu")}</title>
											{mobileMenuOpen ? (
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											) : (
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 6h16M4 12h16M4 18h16"
												/>
											)}
										</svg>
									</button>
								</>
							)}
						</div>

						{searchExpanded && (
							<div className="absolute inset-0 flex items-center  bg-[#C60C30] animate-expand-search">
								<div className="flex-1 py-3">
									<SearchBox
										words={words}
										onClose={() => setSearchExpanded(false)}
										variant="compact"
										autoFocus
									/>
								</div>
								<button
									type="button"
									onClick={() => setSearchExpanded(false)}
									className="text-white hover:opacity-80 transition-opacity mx-4"
									aria-label={t("closeSearch")}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>{t("close")}</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{mobileMenuOpen && (
				<div className="md:hidden bg-[#C60C30] border-t border-red-800">
					<div className="px-4 py-4 space-y-3">
						<Link
							href="/"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("home")}
						</Link>
						<Link
							href="/words"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("words")}
						</Link>
						<Link
							href="/odds"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("odds")}
						</Link>
						<Link
							href="/speeches"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("speeches")}
						</Link>
						<Link
							href="/decades"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("decades")}
						</Link>
						<Link
							href="/monarchs"
							className="block text-white font-medium hover:opacity-80 transition-opacity py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							{t("monarchs")}
						</Link>
						<div className="pt-2 border-t border-red-800">
							<LanguageToggle />
						</div>
					</div>
				</div>
			)}
		</>
	);
}
