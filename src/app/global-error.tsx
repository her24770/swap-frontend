"use client";

import SystemPage from "../components/ui/SystemPage/SystemPage";
import { globalCopy } from "../components/ui/SystemPage/globalCopy";
import { useBrowserPageSettings } from "../components/ui/SystemPage/useBrowserPageSettings";
import "./[locale]/globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale, theme } = useBrowserPageSettings();
  const t = globalCopy[locale];

  return (
    <html lang={locale} data-theme={theme}>
      <body>
        <SystemPage
          kind="error"
          eyebrow={t.error.eyebrow}
          title={t.error.title}
          description={t.error.description}
          actions={
            <>
              <button type="button" className="system-page__action" onClick={reset}>{t.retry}</button>
              <a className="system-page__action system-page__action--secondary" href={`/${locale}`}>{t.home}</a>
            </>
          }
        />
      </body>
    </html>
  );
}
