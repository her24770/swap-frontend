import { getTranslations } from "next-intl/server";
import { Link } from "../../i18n/routing";
import SystemPage from "../../components/ui/SystemPage/SystemPage";

export default async function NotFoundPage() {
  const t = await getTranslations("systemPages");

  return (
    <SystemPage
      kind="not-found"
      eyebrow={t("notFound.eyebrow")}
      title={t("notFound.title")}
      description={t("notFound.description")}
      actions={<Link href="/" className="system-page__action">{t("home")}</Link>}
    />
  );
}
