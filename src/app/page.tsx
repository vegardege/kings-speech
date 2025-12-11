"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";

export default function RootPage() {
	useEffect(() => {
		// Detect browser language
		const browserLang = navigator.language.split("-")[0];

		// Check if browser language is supported, fallback to default
		const locale = routing.locales.includes(browserLang as "en" | "da")
			? browserLang
			: routing.defaultLocale;

		// Redirect to the appropriate locale
		window.location.href = `/${locale}`;
	}, []);

	// Show nothing while redirecting
	return null;
}
