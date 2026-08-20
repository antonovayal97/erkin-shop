import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/media/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/account", destination: "/catalog", permanent: false },
      { source: "/account/:path*", destination: "/catalog", permanent: false },
      { source: "/auth", destination: "/catalog", permanent: false },
      { source: "/auth/:path*", destination: "/catalog", permanent: false },
    ];
  },
};

export default withPayload(nextConfig);
