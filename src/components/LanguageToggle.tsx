"use client";

import { useParams, usePathname } from "next/navigation";

export function LanguageToggle() {
	const pathname = usePathname();
	const params = useParams();
	const currentLocale = params.locale as string;

	// Get the other locale
	const otherLocale = currentLocale === "en" ? "da" : "en";

	// Build the URL for the other locale
	// Remove the current locale prefix and add the new one
	const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");
	const newPath = `/${otherLocale}${pathWithoutLocale}`;

	return (
		<a
			href={newPath}
			className="text-sm text-gray-600 hover:text-[#C60C30] transition-colors"
		>
			{otherLocale === "da" ? "Læs på dansk" : "Read in English"}
		</a>
	);
}
