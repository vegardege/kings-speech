import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { TopMenuBar } from "@/components/TopMenuBar";
import { routing } from "@/i18n/routing";
import { getAllWordsForSearch } from "@/lib/database";
import "../globals.css";

interface LocaleLayoutProps {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function LocaleLayout({
	children,
	params,
}: LocaleLayoutProps) {
	const { locale } = await params;

	// Validate that the incoming locale is valid
	if (!routing.locales.includes(locale as "en" | "da")) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	// Get messages for client components
	const messages = await getMessages();

	// Get words for search
	const words = getAllWordsForSearch();

	return (
		<html lang={locale}>
			<body>
				<NextIntlClientProvider messages={messages}>
					<TopMenuBar words={words} />
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
