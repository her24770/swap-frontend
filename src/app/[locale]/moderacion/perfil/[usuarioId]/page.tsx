"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PerfilExterno from "../../../../../components/perfiles/PerfilExterno/PerfilExterno";
import "../../../perfil/PerfilConsumidorPage.css";

export default function ModeracionPerfilExternoPage() {
  const t = useTranslations("perfil");
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const userId = Number(usuarioId);

  if (!Number.isFinite(userId)) {
    return <main className="perfil-page"><p className="perfil-page__loading">{t("invalidProfile")}</p></main>;
  }

  return (
    <main className="perfil-page">
      <PerfilExterno userId={userId} soloLectura />
    </main>
  );
}
