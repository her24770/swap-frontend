"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { useRouter } from "../../../../i18n/routing";
import { useModeradorSesion } from "../../../../hooks/useModeradorSesion";
import { tienePermiso } from "../../../../lib/moderadorPermisos";
import "../ModeracionPlaceholder.css";

export default function ModeracionModeradoresPage() {
  const t = useTranslations("moderacion.panel");
  const { moderador } = useModeradorSesion();
  const router = useRouter();
  const autorizado = tienePermiso(moderador?.nivel ?? null, "superadmin");

  useEffect(() => {
    if (moderador && !autorizado) {
      router.replace("/moderacion");
    }
  }, [moderador, autorizado, router]);

  if (!moderador || !autorizado) return null;

  return (
    <div className="moderacion-placeholder">
      <Users size={28} />
      <h2 className="moderacion-placeholder__title">{t("sections.moderadores.title")}</h2>
      <p className="moderacion-placeholder__text">{t("comingSoon")}</p>
    </div>
  );
}
