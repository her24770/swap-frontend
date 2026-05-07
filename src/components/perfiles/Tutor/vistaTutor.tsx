"use client";

import { useTranslations } from "next-intl";

export default function VistaTutor() {
  const t = useTranslations("perfil");

  return (
    <section className="perfil-page__section">
      <p className="perfil-page__loading">{t("mode.tutorComingSoon")}</p>
    </section>
  );
}