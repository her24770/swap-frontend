"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Flag, AlertTriangle } from "lucide-react";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../users/UserCard/Comments/CommentSection";
import MiniChatWidget from "../../Chat/MiniChatWidget/MiniChatWidget";
import EnviarMensajeButton from "./EnviarMensajeButton/EnviarMensajeButton";
import ReporteModal from "../../ui/Modal/Reporte/ReporteModal";
import JustificanteModeracionModal from "../../ui/Modal/Reporte/JustificanteModeracionModal";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { getPerfilPublico } from "../../../services/perfilService";
import { usuarioService } from "../../../services/usuarioService";
import { useUIStore } from "../../../store/uiStore";
import { PerspectivaInternaProvider } from "../../../context/PerspectivaInternaContext";
import type { UserProfileData } from "../../../types/perfil";
import { useResenas } from "../../../hooks/fetch/useResenasUsuario";
import { UserProfileHeaderSkeleton } from "../../users/UserCard/UserProfileHeader/UserProfileHeadearSkeleton/UserProfileHeaderSkeleton";
import {
    PerfilModeToggleSkeleton,
    VistaTutorSectionsSkeleton,
    VistaVendedorSectionsSkeleton,
} from "../perfilLoading";
import "../../../app/[locale]/perfil/PerfilConsumidorPage.css";

type PerfilExternoMode = "vendedor" | "tutor";

interface PerfilExternoProps {
  userId: number;
  soloLectura?: boolean;
}

export default function PerfilExterno({ userId, soloLectura = false }: PerfilExternoProps) {
    const t = useTranslations("perfil");
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("modo") === "tutor" ? "tutor" : "vendedor";
    const [mode, setMode] = useState<PerfilExternoMode>(initialMode);
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reporteUsuarioAbierto, setReporteUsuarioAbierto] = useState(false);
    const [advertenciaAbierta, setAdvertenciaAbierta] = useState(false);
    const [enviandoAdvertencia, setEnviandoAdvertencia] = useState(false);
    const { data: ResenasUsuario, loading: loadingResenas, error: errorResenas, refetch: refetchResenas } = useResenas(userId, mode);
    const { agregarNotificacion } = useUIStore();

    const handleEnviarAdvertencia = async (payload: { motivo: string; detalle: string }) => {
        if (!user) return;
        try {
            setEnviandoAdvertencia(true);
            await usuarioService.crearAdvertencia(user.id_usuario, {
                motivo: payload.motivo,
                detalle: payload.detalle || undefined,
            });
            agregarNotificacion({
                tipo: "success",
                mensaje: "Advertencia enviada exitosamente.",
            });
            setAdvertenciaAbierta(false);
        } catch (err) {
            agregarNotificacion({
                tipo: "error",
                mensaje: err instanceof Error ? err.message : "No fue posible enviar la advertencia.",
            });
        } finally {
            setEnviandoAdvertencia(false);
        }
    };

    const modes = useMemo(
        () => [
        { key: "vendedor" as const, label: t("mode.seller") },
        { key: "tutor" as const, label: t("mode.tutor") },
        ],
        [t]
    );

    useEffect(() => {
        setMode(initialMode);
        refetchResenas();
    }, [initialMode]);
    

    
    useEffect(() => {
        const fetchUser = async () => {
        try {
            setError(null);
            setUser(await getPerfilPublico(userId));
        } catch (err: any) {
            setError(err.message || "No fue posible cargar el perfil.");
        }
        };

        fetchUser();
    }, [userId]);


    if (error) {
        return <p className="perfil-page__loading">{error}</p>;
    }

    return (
        <>
        <PerspectivaInternaProvider
        isOwnProfile={false}
        profileView="externo"
        activeProfileMode={mode}
        >
        {!user ? (
            <>
                <UserProfileHeaderSkeleton />
                <PerfilModeToggleSkeleton count={2} />
                <hr className="perfil-page__divider" />
                {initialMode === "tutor" ? (
                    <VistaTutorSectionsSkeleton />
                ) : (
                    <VistaVendedorSectionsSkeleton />
                )}
            </>
        ) : (
            <>
                <UserProfileHeader user={user} />

                <div className="perfil-page__mode-toolbar perfil-page__mode-toolbar--with-action">
                    <div
                        className="perfil-page__mode-toggle"
                        role="tablist"
                        aria-label="Profile mode"
                    >
                        {modes.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={mode === key}
                                className={`perfil-page__mode-btn${
                                    mode === key ? " perfil-page__mode-btn--active" : ""
                                }`}
                                onClick={() => setMode(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {!soloLectura && (
                        <div className="perfil-page__external-actions">
                            <EnviarMensajeButton
                                userId={user.id_usuario}
                                userName={user.name}
                                userImageUrl={user.imageUrl}
                            />
                            <button
                                type="button"
                                className="perfil-page__secondary-btn"
                                onClick={() => setReporteUsuarioAbierto(true)}
                            >
                                <Flag size={16} />
                                Reportar
                            </button>
                        </div>
                    )}

                    {soloLectura && (
                        <div className="perfil-page__external-actions perfil-page__external-actions--moderador">
                            <button
                                type="button"
                                className="button button--medium button--secondary"
                                onClick={() => setReporteUsuarioAbierto(true)}
                            >
                                <Flag size={16} /> Reportar
                            </button>
                            <button
                                type="button"
                                className="button button--medium button--warning"
                                onClick={() => setAdvertenciaAbierta(true)}
                            >
                                <AlertTriangle size={16} /> Advertencia
                            </button>
                        </div>
                    )}
                </div>

                <hr className="perfil-page__divider" />

                {mode === "vendedor" && (
                    <VistaVendedor
                        userId={userId}
                        userName={user.name}
                        userRating={user.rating}
                        userImageUrl={user.imageUrl}
                        soloLectura={soloLectura}
                    />
                )}
                {mode === "tutor" && (
                    <VistaTutor
                        userId={userId}
                        userName={user.name}
                        userRating={user.rating}
                        userImageUrl={user.imageUrl}
                        soloLectura={soloLectura}
                    />
                )}

                <hr className="perfil-page__divider" />

                <section className="perfil-page__section">
                    <CommentSection
                        targetName={user.name}
                        idReceptor={user.id_usuario}
                        comments={ResenasUsuario}
                        onSuccessSubmit={() => {
                            getPerfilPublico(userId).then((updatedUser) => setUser(updatedUser));
                            refetchResenas();
                        }}
                        onCancel={() => {}}
                        soloLectura={soloLectura}
                    />
                </section>
            </>
        )}
        </PerspectivaInternaProvider>

        {user && !soloLectura && (
            <MiniChatWidget
                idUsuario={user.id_usuario}
                nombre={user.name}
                avatarUrl={user.imageUrl}
            />
        )}

        {user && (
            <ReporteModal
                isOpen={reporteUsuarioAbierto}
                tipoObjetivo="usuario"
                idObjetivo={user.id_usuario}
                onClose={() => setReporteUsuarioAbierto(false)}
            />
        )}

        {user && soloLectura && (
            <JustificanteModeracionModal
                isOpen={advertenciaAbierta}
                tipoObjetivo="usuario"
                titulo="Enviar advertencia"
                pregunta="¿Por qué quieres advertir a este usuario?"
                enviando={enviandoAdvertencia}
                onClose={() => setAdvertenciaAbierta(false)}
                onSubmit={handleEnviarAdvertencia}
            />
        )}
        </>
    );
}
