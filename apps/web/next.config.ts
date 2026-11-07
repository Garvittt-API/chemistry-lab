import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    "@virtual-chemistry-lab/experiment-schema",
    "@virtual-chemistry-lab/experiment-library",
    "@virtual-chemistry-lab/simulation-core",
    "@virtual-chemistry-lab/laboratory-core",
    "@virtual-chemistry-lab/molecular-visualization",
    "@virtual-chemistry-lab/learning-core",
  ],
};

export default nextConfig;
