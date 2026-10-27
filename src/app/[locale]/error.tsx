"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../i18n/routing";
import SystemPage from "../../components/ui/SystemPage/SystemPage";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("systemPages");

  return (
    <SystemPage
      kind="error"
      eyebrow={t("error.eyebrow")}
      title={t("error.title")}
      description={t("error.description")}
      actions={
        <>
          <button type="button" className="system-page__action" onClick={reset}>{t("retry")}</button>
          <Link href="/" className="system-page__action system-page__action--secondary">{t("home")}</Link>
        </>
      }
    />
  );
}
