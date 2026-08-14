"use client";

import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import "../ModeracionPlaceholder.css";

export default function ModeracionReportesPage() {
  const t = useTranslations("moderacion.panel");

  return (
    <div className="moderacion-placeholder">
      <ShieldAlert size={28} />
      <h2 className="moderacion-placeholder__title">{t("sections.reportes.title")}</h2>
      <p className="moderacion-placeholder__text">{t("comingSoon")}</p>
    </div>
  );
}
