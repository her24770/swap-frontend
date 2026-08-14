"use client";

import { useParams } from "next/navigation";
import PerfilExterno from "../../../../../components/perfiles/PerfilExterno/PerfilExterno";
import "../../../perfil/PerfilConsumidorPage.css";

export default function ModeracionPerfilExternoPage() {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const userId = Number(usuarioId);

  if (!Number.isFinite(userId)) {
    return <main className="perfil-page"><p className="perfil-page__loading">Perfil no válido.</p></main>;
  }

  return (
    <main className="perfil-page">
      <PerfilExterno userId={userId} soloLectura />
    </main>
  );
}
