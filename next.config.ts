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
};

export default nextConfig;
