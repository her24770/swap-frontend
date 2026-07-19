"use client";

import { useTranslations } from "next-intl";
import PublicacionesGuardadas from "./PublicacionesGuardadas/PublicacionesGuardadas";
import HistorialAcuerdos from "./HistorialAcuerdos/HistorialAcuerdos";
import { useAuthStore } from "../../../store/authStore";
import { PerfilPurchasesCarouselSkeleton } from "../perfilLoading";

interface VistaConsumidorProps {
  purchasesLoading?: boolean;
}

export default function VistaConsumidor({ purchasesLoading = false }: VistaConsumidorProps) {
  const t = useTranslations("perfil");
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);

  return (
    <>
      <PublicacionesGuardadas />

      <hr className="perfil-page__divider" />

      {purchasesLoading ? (
        <>
          <section className="perfil-page__section">
            <h2 className="perfil-page__section-title">{t("sections.purchases")}</h2>
            <PerfilPurchasesCarouselSkeleton count={4} />
          </section>

          <hr className="perfil-page__divider" />

          <section className="perfil-page__section">
            <h2 className="perfil-page__section-title">{t("sections.tutoringHistory")}</h2>
            <PerfilPurchasesCarouselSkeleton count={4} />
          </section>
        </>
      ) : (
        <>
          <HistorialAcuerdos
            idUsuario={idUsuario}
            tipo="producto"
            title={t("sections.purchases")}
            emptyMessage={t("history.emptyProducts")}
            showViewAllButton
            viewAllHref="/perfil/historial?tipo=producto"
          />

          <hr className="perfil-page__divider" />

          <HistorialAcuerdos
            idUsuario={idUsuario}
            tipo="tutoria"
            title={t("sections.tutoringHistory")}
            emptyMessage={t("history.emptyTutoring")}
            showViewAllButton
            viewAllHref="/perfil/historial?tipo=tutoria"
          />
        </>
      )}
    </>
  );
}
