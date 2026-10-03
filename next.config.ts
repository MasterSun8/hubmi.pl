import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "hubmi-innovations.org" }],
        destination: "https://www.hubmi-innovations.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
