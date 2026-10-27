import { headers } from "next/headers";
import SystemPage from "../components/ui/SystemPage/SystemPage";
import { globalCopy, type Locale } from "../components/ui/SystemPage/globalCopy";
import ThemeBootstrap from "../components/ui/SystemPage/ThemeBootstrap";
import "./[locale]/globals.css";

export default async function GlobalNotFound() {
  const requestedLocale = (await headers()).get("x-swap-locale");
  const locale: Locale = requestedLocale === "en" || requestedLocale === "fr" ? requestedLocale : "es";
  const t = globalCopy[locale];

  return (
    <html lang={locale}>
      <body>
        <ThemeBootstrap />
        <SystemPage
          kind="not-found"
          eyebrow={t.notFound.eyebrow}
          title={t.notFound.title}
          description={t.notFound.description}
          actions={<a href={`/${locale}`} className="system-page__action">{t.home}</a>}
        />
      </body>
    </html>
  );
}
