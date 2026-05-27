"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../users/UserCard/Comments/CommentSection";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { getPerfilPublico } from "../../../services/perfilService";
import { PerspectivaInternaProvider } from "../../../context/PerspectivaInternaContext";
import type { UserProfileData } from "../../../types/perfil";
import { useResenas } from "../../../hooks/fetch/useResenasUsuario";
type PerfilExternoMode = "vendedor" | "tutor";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { usePublicacionesDestacadas } from "../../../hooks/fetch/usePublicacionesDestacadas";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import PostCard from "../../posts/PostCard/PostCard";

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
    const { data: ResenasUsuario, loading: loadingResenas, error: errorResenas, refetch: refetchResenas } = useResenas(userId, mode);

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

        <hr className="perfil-page__divider" />

        <section className="perfil-page__section">
            <h2 className="perfil-page__section-title">{t("sections.comments")}</h2>
            <CommentSection
                targetName={user.name}
                idReceptor={user.id_usuario} 
                comments={ResenasUsuario} 
                onSuccessSubmit={refetchResenas}
                onCancel={() => {}}
            />
        </section>
        </PerspectivaInternaProvider>
    );
}
