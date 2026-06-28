import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/skillforge",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
