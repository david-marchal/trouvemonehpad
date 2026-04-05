import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/carte",
        destination: "/search",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
