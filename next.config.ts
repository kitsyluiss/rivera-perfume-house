import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Prefer AVIF then WebP — drastically smaller file sizes on mobile
    formats: ["image/avif", "image/webp"],
    // Device widths covering the range of phones → desktops
    deviceSizes: [375, 430, 640, 750, 828, 1080, 1200, 1920],
    // Intermediate sizes used in srcset for layout="fill" / "responsive"
    imageSizes: [64, 128, 256, 384, 512],
    minimumCacheTTL: 86400, // 24 h CDN cache for optimised images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
