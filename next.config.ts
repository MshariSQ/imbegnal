import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Served from the root of the custom domain imbegnal.com — no basePath.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
