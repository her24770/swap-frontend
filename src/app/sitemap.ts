import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swap.jhgo.online";
  const rutasPublicas = ["login", "registro", "forgot-password"];
  const locales = ["es", "en", "fr"];

  return locales.flatMap((locale) => rutasPublicas.map((ruta) => ({
    url: `${baseUrl}/${locale}/${ruta}`,
    changeFrequency: "monthly" as const,
    priority: ruta === "login" ? 0.8 : 0.6,
  })));
}
