import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import DetalleUsuario from "../../ui/Modal/DetalleUsuario/DetalleUsuario";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import type { PublicacionDetalle, TutorFiltrado } from "../../../types/publicacion";
import { toVisualStarRating } from "./publicacionesListUtils";

type Props = {
    selectedPublicacion: PublicacionDetalle | null;
    loadingDetalle: boolean;
    onClosePublicacion: () => void;
    onPublicacionEliminada: (idPublicacion: number) => void;
    selectedTutor: TutorFiltrado | null;
    onCloseTutor: () => void;
    soloLectura: boolean;
    perfilBasePath: string;
};

// Modales de detalle de publicación y de tutor.
export default function PublicacionesDetalleModales({
    selectedPublicacion,
    loadingDetalle,
    onClosePublicacion,
    onPublicacionEliminada,
    selectedTutor,
    onCloseTutor,
    soloLectura,
    perfilBasePath,
}: Props) {
    const t = useTranslations("seccion");
    const tTags = useTranslations("common.tags");
    const router = useRouter();

    const navigateToTutorProfile = (userId: number, verCertificados = false) => {
        onCloseTutor();
        router.push(`${perfilBasePath}/${userId}?modo=tutor${verCertificados ? "&certificados=1" : ""}`);
    };

    return (
        <>
            {selectedPublicacion && (
                <DetallePublicacion
                    soloLectura={soloLectura}
                    isOpen={true}
                    onClose={onClosePublicacion}
                    onEliminada={() => onPublicacionEliminada(selectedPublicacion.id_publicacion)}
                    type={selectedPublicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
                    title={selectedPublicacion.titulo}
                    price={parseFloat(selectedPublicacion.precio)}
                    description={selectedPublicacion.descripcion}
                    imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
                    images={selectedPublicacion.imagenes.map((img) => img.url_imagen)}
                    tags={mapPublicacionEtiquetasToTags(selectedPublicacion.etiquetas, {
                        name: selectedPublicacion.tipoPerfil?.tipo_perfil ?? tTags("negocio"),
                    })}
                    likes={selectedPublicacion.me_gusta}
                    publicacionId={selectedPublicacion.id_publicacion}
                    sellerName={loadingDetalle ? t("loading") : (selectedPublicacion.usuario.nombre ?? "Usuario SWAP")}
                    sellerRating={selectedPublicacion.usuario.calificacion ?? 0}
                    sellerId={selectedPublicacion.usuario.id_usuario}
                    sellerImageUrl={selectedPublicacion.usuario.url_foto_perfil}
                    estado={selectedPublicacion.estadoRel?.estado}
                    onSellerClick={(sellerId) => {
                        onClosePublicacion();
                        router.push(`${perfilBasePath}/${sellerId}?modo=tutor`);
                    }}
                    onVerCertificados={() => {
                        const sellerId = selectedPublicacion.usuario.id_usuario;
                        onClosePublicacion();
                        router.push(`${perfilBasePath}/${sellerId}?modo=tutor&certificaciones=1`);
                    }}
                />
            )}

            {selectedTutor && (
                <DetalleUsuario
                    isOpen
                    onClose={onCloseTutor}
                    userId={selectedTutor.id_usuario}
                    userName={selectedTutor.nombre}
                    userRating={toVisualStarRating(selectedTutor.calificacion)}
                    userImageUrl={
                        selectedTutor.url_foto_perfil
                            ? normalizeImageUrl(selectedTutor.url_foto_perfil)
                            : undefined
                    }
                    temas={selectedTutor.publicaciones?.map((p) => p.titulo) || []}
                    tags={[
                        ...(selectedTutor.etiquetas?.map((e) => ({
                            id: e.etiqueta.id_etiqueta,
                            name: e.etiqueta.nombre,
                            parentId: e.etiqueta.id_etiqueta_padre,
                        })) || []),
                    ]}
                    onVerCertificados={() => navigateToTutorProfile(selectedTutor.id_usuario, true)}
                    onVerPerfil={(id) => navigateToTutorProfile(id)}
                />
            )}
        </>
    );
}
