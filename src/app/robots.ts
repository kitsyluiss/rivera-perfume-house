import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rivera.perfumehouse.workers.dev").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalog",
          "/collections",
          "/about",
          "/atelier",
          "/journal",
          "/perfumes/",
          "/logo.svg",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/orders",
          "/orders/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/unauthorized",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
