import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllSpeeches } from "@/lib/database";
import { SpeechesPageClient } from "./SpeechesPageClient";

interface SpeechesPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default async function SpeechesPage({ params }: SpeechesPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("speeches");
	const speeches = getAllSpeeches();

	const translations = {
		title: t("title"),
		description: t("description"),
		words: t("words"),
		aboutTitle: t("aboutTitle"),
		aboutDescription: t("aboutDescription"),
	};

	return (
		<SpeechesPageClient
			speeches={speeches}
			locale={locale}
			translations={translations}
		/>
	);
}
