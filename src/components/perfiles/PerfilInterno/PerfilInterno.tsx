"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../users/UserCard/Comments/CommentSection";
import VistaConsumidor from "../Consumidor/vistaConsumidor";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { apiClient } from "../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../lib/authResponse";
import { getPerfilPublico } from "../../../services/perfilService";
import {
  PerspectivaInternaProvider,
  usePerspectivaInterna,
} from "../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../store/authStore";
import type { ApiResult } from "../../../types/ApiResult";
import type { AuthResponse } from "../../../types/usuario";
import type { UserProfileData } from "../../../types/perfil";
import { useResenas } from "../../../hooks/fetch/useResenasUsuario";
import FeaturedPublicationsCarousel from "../FeaturedPublicationsCarousel/FeaturedPublicationsCarousel";


type PerfilMode = "consumidor" | "vendedor" | "tutor";

export default function PerfilInterno() {
  const t = useTranslations("perfil");

  const [mode, setMode] = useState<PerfilMode>("consumidor");
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);
  const login = useAuthStore((s) => s.login);
  const { data: ResenasUsuario, loading: loadingResenas, error: errorResenas, refetch: refetchResenas } = useResenas(idUsuario, mode);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        let usuarioId = idUsuario;

        if (!usuarioId) {
          const sesionResponse = await apiClient.get<ApiResult<AuthResponse> | AuthResponse>(
            "/api/auth/me"
          );
          const sesion = unwrapAuthResponse(sesionResponse);
          login(sesion.usuario, sesion.rol);
          usuarioId = sesion.usuario.id_usuario;
        }

        setUser(await getPerfilPublico(usuarioId));
      } catch (err: any) {
        setError(err.message || "No fue posible cargar tu perfil.");
      }
    };

    fetchUser();
  }, [idUsuario, login]);

  if (error) return <p className="perfil-page__loading">{error}</p>;
  if (!user) return <p className="perfil-page__loading">{t("loading")}</p>;

  const MODES: { key: PerfilMode; label: string }[] = [
    { key: "consumidor", label: t("mode.consumer") },
    { key: "vendedor", label: t("mode.seller") },
    { key: "tutor", label: t("mode.tutor") },
  ];

  return (
    <PerspectivaInternaProvider
      isOwnProfile={true}
      profileView="interno"
      activeProfileMode={mode}
    >
      <UserProfileHeader
        user={user}
        onSave={async (updated) => {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  name: updated.name ?? prev.name,
                  description: updated.description ?? prev.description,
                  imageUrl: updated.imageUrl ?? prev.imageUrl,
                  contacts: updated.contacts
                    ? updated.contacts.map((c: any) => ({
                        platform: c.tipo_contacto,
                        url: c.valor,
                      }))
                    : prev.contacts,
                }
              : prev
          );
        }}
      />

      <PerfilModeToggle
        mode={mode}
        modes={MODES}
        onModeChange={setMode}
      />

      {(mode === "vendedor" || mode === "tutor") && (
        <FeaturedPublicationsCarousel userId={idUsuario ?? undefined} />
      )}
      
      <hr className="perfil-page__divider" />

      {mode === "consumidor" && <VistaConsumidor />}
      {mode === "vendedor" && (
        
        <VistaVendedor
          userName={user.name}
          userRating={0}
          userImageUrl={user.imageUrl}
        />
      )}
      {mode === "tutor" && (
        <VistaTutor
          userName={user.name}
          userRating={0}
          userImageUrl={user.imageUrl}
        />
      )}
      <hr className="perfil-page__divider" />

      {mode !== "consumidor" && (
        <>
          <hr className="perfil-page__divider" />
          <CommentSection
            targetName={user.name}
            idReceptor={user.id_usuario} 
            comments={ResenasUsuario || []} 
            onSuccessSubmit={refetchResenas}
            onCancel={() => {}}
          />
        </>
      )}
    </PerspectivaInternaProvider>
  );
}

interface PerfilModeToggleProps {
  mode: PerfilMode;
  modes: { key: PerfilMode; label: string }[];
  onModeChange: (mode: PerfilMode) => void;
}

function PerfilModeToggle({
  mode,
  modes,
  onModeChange,
}: PerfilModeToggleProps) {
  const { canViewConsumerSection } = usePerspectivaInterna();
  const visibleModes = canViewConsumerSection
    ? modes
    : modes.filter(({ key }) => key !== "consumidor");
  
  return (
    <div className="perfil-page__mode-toggle">
      {visibleModes.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`perfil-page__mode-btn${
            mode === key ? " perfil-page__mode-btn--active" : ""
          }`}
          onClick={() => onModeChange(key) }
        >
          {label}
        </button>
      ))}
    </div>
  );
}