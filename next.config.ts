import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server serve its assets when the app is opened at 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
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
