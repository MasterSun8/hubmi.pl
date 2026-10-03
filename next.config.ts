import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "hubmi.pl" }],
        destination: "https://www.hubmi.pl/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
