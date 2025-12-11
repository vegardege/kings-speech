import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// All supported locales
	locales: ["en", "da"],

	// Used when no locale matches
	defaultLocale: "en",

	// Always use locale prefix (/en/..., /da/...)
	localePrefix: "always",

	// Disable locale detection for static export
	// (cannot detect on server since it's static HTML)
	localeDetection: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
	createNavigation(routing);
