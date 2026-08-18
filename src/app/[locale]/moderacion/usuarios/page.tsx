"use client";

import UsuariosModeracion from "../../../../components/moderacion/UsuariosModeracion/UsuariosModeracion";
import { useModeradorSesion } from "../../../../hooks/useModeradorSesion";

export default function ModeracionUsuariosPage() {
  const { moderador } = useModeradorSesion();

  if (!moderador) return null;

  return <UsuariosModeracion />;
}