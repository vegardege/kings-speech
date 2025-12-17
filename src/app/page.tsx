import { headers } from "next/headers";
import { redirect, routing } from "@/i18n/routing";

export default async function RootPage() {
	// Get the Accept-Language header to detect browser language
	const headersList = await headers();
	const acceptLanguage = headersList.get("accept-language") || "";

	// Parse the first language from Accept-Language header
	const browserLang = acceptLanguage.split(",")[0]?.split("-")[0] || "";

	// Check if browser language is supported, fallback to default
	const locale = routing.locales.includes(browserLang as "en" | "da")
		? browserLang
		: routing.defaultLocale;

	// Server-side redirect to the appropriate locale
	redirect({ href: "/", locale: locale as "en" | "da" });
}
