import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "otyxdfwoguvxakczxdpi.supabase.co",
        pathname: "/storage/v1/object/sign/private-avatars/**",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
