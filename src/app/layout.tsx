import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "King's Speech",
	description: "Statistics and analysis of the Danish Monarch's New Year's Eve speeches",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="da">
			<body>{children}</body>
		</html>
	);
}
