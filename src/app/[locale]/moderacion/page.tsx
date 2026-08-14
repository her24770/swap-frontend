"use client";

import { useTranslations } from "next-intl";
import { Newspaper, ShieldAlert, Users } from "lucide-react";
import { Link } from "../../../i18n/routing";
import { useModeradorSesion } from "../../../hooks/useModeradorSesion";
import { tienePermiso } from "../../../lib/moderadorPermisos";
import "./ModeracionDashboard.css";

export default function ModeracionDashboardPage() {
  const t = useTranslations("moderacion.panel");
  const { moderador } = useModeradorSesion();

  if (!moderador) return null;

  return (
    <div className="moderacion-dashboard">
      <h1 className="moderacion-dashboard__greeting">
        {t("greeting", { usuario: moderador.usuario })}
      </h1>

      <div className="moderacion-dashboard__grid">
        <Link href="/moderacion/publicaciones" className="moderacion-dashboard__card">
          <Newspaper size={22} />
          <span className="moderacion-dashboard__card-title">
            {t("sections.publicaciones.title")}
          </span>
          <span className="moderacion-dashboard__card-description">
            {t("sections.publicaciones.description")}
          </span>
        </Link>

        <Link href="/moderacion/reportes" className="moderacion-dashboard__card">
          <ShieldAlert size={22} />
          <span className="moderacion-dashboard__card-title">
            {t("sections.reportes.title")}
          </span>
          <span className="moderacion-dashboard__card-description">
            {t("sections.reportes.description")}
          </span>
        </Link>

        {tienePermiso(moderador.nivel, "superadmin") && (
          <Link href="/moderacion/moderadores" className="moderacion-dashboard__card">
            <Users size={22} />
            <span className="moderacion-dashboard__card-title">
              {t("sections.moderadores.title")}
            </span>
            <span className="moderacion-dashboard__card-description">
              {t("sections.moderadores.description")}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
