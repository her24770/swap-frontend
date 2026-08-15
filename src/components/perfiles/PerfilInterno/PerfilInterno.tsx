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
import { useModeradorAuthStore } from "../../../store/moderadorAuthStore";
import type { ApiResult } from "../../../types/ApiResult";
import type { AuthResponse } from "../../../types/usuario";
import type { UserProfileData } from "../../../types/perfil";
import { useResenas } from "../../../hooks/fetch/useResenasUsuario";
import { UserProfileHeaderSkeleton } from "../../users/UserCard/UserProfileHeader/UserProfileHeadearSkeleton/UserProfileHeaderSkeleton";
import { PerfilModeToggleSkeleton } from "../perfilLoading";
import "../../../app/[locale]/perfil/PerfilConsumidorPage.css";


type PerfilMode = "consumidor" | "vendedor" | "tutor";

export default function PerfilInterno() {
  const t = useTranslations("perfil");

  const [mode, setMode] = useState<PerfilMode>("consumidor");
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);
  const login = useAuthStore((s) => s.login);
  const moderador = useModeradorAuthStore((s) => s.moderador);
  const { data: ResenasUsuario, loading: loadingResenas, error: errorResenas, refetch: refetchResenas } = useResenas(idUsuario, mode);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        let usuarioId = idUsuario;

        if (!usuarioId) {
          // Si solo hay sesion de moderador (sin sesion de usuario), NO se resuelve /api/auth/me
          if (moderador) {
            setError("Los moderadores no tienen un perfil de usuario propio.");
            return;
          }

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
  }, [idUsuario, login, moderador]);

  if (error) return <p className="perfil-page__loading">{error}</p>;

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
      {!user ? (
        <>
          <UserProfileHeaderSkeleton />
          <PerfilModeToggleSkeleton count={3} />
          <hr className="perfil-page__divider" />
          <VistaConsumidor purchasesLoading />
        </>
      ) : (
        <>
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

          <div className="perfil-page__mode-toolbar">
            <PerfilModeToggle
              mode={mode}
              modes={MODES}
              onModeChange={setMode}
            />
          </div>

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
  
  if (visibleModes.length === 0) return null;

  return (
    <div
      className="perfil-page__mode-toggle"
      role="tablist"
      aria-label="Profile mode"
    >
      {visibleModes.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={mode === key}
          className={`perfil-page__mode-btn${
            mode === key ? " perfil-page__mode-btn--active" : ""
          }`}
          onClick={() => onModeChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}