"use client";

import PalabrasModeracion from "../../../../components/moderacion/PalabrasModeracion/PalabrasModeracion";
import { useModeradorSesion } from "../../../../hooks/useModeradorSesion";

export default function ModeracionPalabrasPage() {
  const { moderador } = useModeradorSesion();

  if (!moderador) return null;

  return <PalabrasModeracion />;
}