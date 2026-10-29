import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swap.jhgo.online";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/es/moderacion/", "/en/moderacion/", "/fr/moderacion/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
