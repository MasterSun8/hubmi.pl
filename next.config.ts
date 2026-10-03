import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server serve its assets when the app is opened at 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
