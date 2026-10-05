"use client";

import PublicacionesModeracion from "../../../../components/moderacion/PublicacionesModeracion/PublicacionesModeracion";
import { useModeradorSesion } from "../../../../hooks/useModeradorSesion";

export default function ModeracionPublicacionesPage() {
  const { moderador } = useModeradorSesion();

  if (!moderador) return null;

  return <PublicacionesModeracion />;
}
