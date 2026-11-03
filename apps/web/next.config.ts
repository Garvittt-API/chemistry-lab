import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@virtual-chemistry-lab/experiment-schema"],
};

export default nextConfig;
