"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { apiClient } from "../../../lib/apiClient";
import { obtenerContactosUsuario } from "../../../lib/contactosUsuario";
import { TAGS_MATERIAS } from "../../../lib/tags";
import { PerspectivaInternaProvider } from "../../../context/PerspectivaInternaContext";
import type { UserProfileData } from "../../../types/perfil";

type PerfilExternoMode = "vendedor" | "tutor";

interface PerfilExternoProps {
  userId: number;
}

export default function PerfilExterno({ userId }: PerfilExternoProps) {
  const t = useTranslations("perfil");
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("modo") === "tutor" ? "tutor" : "vendedor";

  const [mode, setMode] = useState<PerfilExternoMode>(initialMode);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modes = useMemo(
    () => [
      { key: "vendedor" as const, label: t("mode.seller") },
      { key: "tutor" as const, label: t("mode.tutor") },
    ],
    [t]
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        const data = await apiClient.get<any>(`/api/user/${userId}`);
        const contacts = await obtenerContactosUsuario(userId);
        setUser({
          id_usuario: data.id_usuario,
          name: data.nombre,
          description: data.descripcion,
          imageUrl: data.url_foto_perfil,
          rating: Number(data.calificacion),
          totalReviews: 0,
          contacts,
          paymentMethod: data.metodo_pago,
          tags: TAGS_MATERIAS,
        });
      } catch (err: any) {
        setError(err.message || "No fue posible cargar el perfil.");
      }
    };

    fetchUser();
  }, [userId]);

  if (error) {
    return <p className="perfil-page__loading">{error}</p>;
  }

  if (!user) {
    return <p className="perfil-page__loading">{t("loading")}</p>;
  }

  return (
    <PerspectivaInternaProvider
      isOwnProfile={false}
      profileView="externo"
      activeProfileMode={mode}
    >
      <UserProfileHeader user={user} />

      <div className="perfil-page__mode-toggle">
        {modes.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`perfil-page__mode-btn${
              mode === key ? " perfil-page__mode-btn--active" : ""
            }`}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <hr className="perfil-page__divider" />

      {mode === "vendedor" && (
        <VistaVendedor
          userId={userId}
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}
      {mode === "tutor" && (
        <VistaTutor
          userId={userId}
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}
    </PerspectivaInternaProvider>
  );
}
