import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const parseAllowedDevOrigins = (): string[] => {
  const defaults = ["192.168.0.*", "192.168.1.*", "10.0.0.*"];
  const envValue = process.env.ALLOWED_DEV_ORIGINS?.trim();

  if (!envValue) {
    return defaults;
  }

  const custom = envValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...custom])];
};

// Standalone needs symlinks; Windows often blocks them (EPERM) without Developer Mode.
// Keep standalone for Linux/CI/Docker; skip it on Windows local builds.
const enableStandalone =
  process.env.FORCE_STANDALONE === "1" || process.platform !== "win32";

const nextConfig: NextConfig = {
  ...(enableStandalone ? { output: "standalone" as const } : {}),
  reactStrictMode: false,
  allowedDevOrigins: parseAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: true,
  },
  // Adjust source map handling to avoid invalid third-party maps crashing dev
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use a resilient devtool to minimize source map parsing issues
      config.devtool = isServer ? "eval-source-map" : "cheap-module-source-map";
      // Silence non-conformant source map warnings from dependencies
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Invalid source map/,
        /sourceMapURL could not be parsed/,
      ];
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);
