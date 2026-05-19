"use client";

import { useParams } from "next/navigation";
import PerfilExterno from "../../../../components/perfiles/PerfilExterno/PerfilExterno";
import "../PerfilConsumidorPage.css";

export default function PerfilExternoPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  if (!Number.isFinite(userId)) {
    return <main className="perfil-page"><p className="perfil-page__loading">Perfil no válido.</p></main>;
  }

  return (
    <main className="perfil-page">
      <PerfilExterno userId={userId} />
    </main>
  );
}
