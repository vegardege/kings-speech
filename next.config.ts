import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	output: "export",
};

export default withNextIntl(nextConfig);
