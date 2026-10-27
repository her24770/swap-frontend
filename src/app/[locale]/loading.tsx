"use client";

import { useTranslations } from "next-intl";
import SystemPage from "../../components/ui/SystemPage/SystemPage";

export default function LoadingPage() {
  const t = useTranslations("systemPages.loading");
  return <SystemPage kind="loading" title={t("title")} description={t("description")} />;
}
