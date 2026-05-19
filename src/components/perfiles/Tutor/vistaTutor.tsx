"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import PostCard from "../../posts/PostCard/PostCard";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import HorarioSemanal, { EstadoHorario } from "./Horario/Horario";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { TAG_TUTORIA } from "../../../lib/tags";
import { useEstados } from "../../../hooks/useEstados";
import { useAuthStore } from "../../../store/authStore";
import "../../ui/Modal/Modal.css";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";

interface CatalogPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
  categorias: number[];
}

interface EspaciosHorario {
  dia: string;
  hora: number;
  estado: EstadoHorario;
}

const MOCK_SLOTS: EspaciosHorario[] = [
  { dia: "Lunes",   hora: 10, estado: "ocupado" },
  { dia: "Lunes",   hora: 14, estado: "disponible" },
  { dia: "Lunes",   hora: 15, estado: "disponible" },
  { dia: "Martes",  hora: 7,  estado: "disponible" },
  { dia: "Martes",  hora: 8,  estado: "disponible" },
  { dia: "Martes",  hora: 9,  estado: "disponible" },
  { dia: "Miérc.",  hora: 10, estado: "disponible" },
  { dia: "Miérc.",  hora: 17, estado: "ocupado" },
  { dia: "Jueves",  hora: 12, estado: "ocupado" },
  { dia: "Jueves",  hora: 14, estado: "ocupado" },
  { dia: "Viernes", hora: 9,  estado: "ocupado" },
  { dia: "Viernes", hora: 12, estado: "disponible" },
  { dia: "Sábado",  hora: 9,  estado: "ocupado" },
  { dia: "Sábado",  hora: 14, estado: "disponible" },
  { dia: "Domingo", hora: 9,  estado: "ocupado" },
  { dia: "Domingo", hora: 10, estado: "disponible" },
];


interface VistaTutorProps {
  userId?: number;
  userName?: string;
  userRating?: number;
  userImageUrl?: string;
}

export default function VistaTutor({
  userId,
  userName = "Usuario de SWAP",
  userRating = 0,
  userImageUrl,
}: VistaTutorProps = {}) {
  const t = useTranslations("perfil");
  const authUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const idUsuario = userId ?? authUserId;
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();
  const estadosTutoria = useEstados("tutoria");

  const [catalogTutorias, setCatalogTutorias] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) {
      setCatalogTutorias([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resTutorias = await apiClient.get<PublicacionesResponse>(
        `/api/publicacion/user/${idUsuario}?tipo=tutoria&all=true`
      );

      const mapPublicaciones = (data: Publicacion[]): CatalogPost[] =>
        data.map((pub) => ({
          id: pub.id_publicacion,
          title: pub.titulo,
          price: typeof pub.precio === "string" ? parseFloat(pub.precio) : pub.precio,
          description: pub.descripcion,
          tags: [{ ...TAG_TUTORIA, name: "Tutoría" }],
          estado: pub.estadoRel?.estado ?? "activo",
          images: pub.imagenes?.map((img) => img.url_imagen) || [],
          categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
        }));

      setCatalogTutorias(mapPublicaciones(resTutorias.data));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las tutorías");
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  const handleEliminar = useCallback(async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta publicación?")) return;

    try {
      await apiClient.delete(`/api/publicacion/${id}`);
      fetchPublicaciones();
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || "No fue posible eliminar la publicación.");
    }
  }, [fetchPublicaciones]);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  return (
    <>
      {/* Catalogo de tutorias con carrusel de cards */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalog")}</h2>
          {canCreatePublication && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
              onClick={() => setCrearOpen(true)}
            >
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.newPublication")}
            </button>
          )}
        </div>

        {loading && (
          <p className="perfil-page__coming-soon">Cargando tutorías...</p>
        )}

        {error && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {error}
          </p>
        )}

        {!loading && !error && catalogTutorias.length === 0 && (
          <p className="perfil-page__coming-soon">
            Aún no tienes tutorías publicadas.
          </p>
        )}

        {!loading && !error && catalogTutorias.length > 0 && (
          <HorizontalCarousel>
            {catalogTutorias.map((pub) => (
              <div key={pub.id} className="h-carousel__item">
                <PostCard
                  publicacionId={pub.id}
                  tags={pub.tags}
                  title={pub.title}
                  price={pub.price}
                  description={pub.description}
                  images={pub.images}
                  estado={pub.estado}
                  estadosDisponibles={estadosTutoria}
                  onEditClick={() => {
                    setPostEditando(pub);
                    setEditOpen(true);
                  }}
                  onDeleteClick={() => handleEliminar(pub.id)}
                  onImageUpdate={(newUrl) => {
                    setCatalogTutorias((prev) =>
                      prev.map((p) =>
                        p.id === pub.id ? { ...p, images: [newUrl, ...p.images.slice(1)] } : p
                      )
                    );
                  }}
                  onEstadoChange={async (nuevoEstado) => {
                    try {
                      await apiClient.put(`/api/publicacion/${pub.id}`, {
                        estado: nuevoEstado,
                        etiquetas: pub.categorias,
                      });
                      setCatalogTutorias((prev) =>
                        prev.map((p) => p.id === pub.id ? { ...p, estado: nuevoEstado } : p)
                      );
                    } catch (err) {
                      const apiError = err as ApiError;
                      alert(apiError.message || "No fue posible cambiar el estado.");
                    }
                  }}
                  onDetallesClick={() => setSelectedPost(pub)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        )}
      </section>

      <hr className="perfil-page__divider" />

      {/* modal de crear publicaiciones  */}
      {canCreatePublication && crearOpen && (
        <div className="modal-overlay" onClick={() => setCrearOpen(false)}>
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.createPublicationAria")}
          >
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="crear"
                onCancel={() => setCrearOpen(false)}
                onSuccess={() => {
                  setCrearOpen(false);
                  fetchPublicaciones();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal editar publicacion */}
      {canEditCards && editOpen && postEditando && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.editPublicationAria")}
          >
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="editar"
                publicacionId={postEditando.id}
                defaultValues={{
                  titulo:           postEditando.title,
                  descripcion:      postEditando.description,
                  precio:           String(postEditando.price),
                  tipo_publicacion: "tutoria",
                  categorias:       postEditando.categorias,
                  destacado:        false,
                  estado:           postEditando.estado as "disponible" | "vendido" | "reservado",
                }}
                onCancel={() => { setEditOpen(false); setPostEditando(null); }}
                onSuccess={() => {
                  setEditOpen(false);
                  setPostEditando(null);
                  fetchPublicaciones();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Horario semanal */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.schedule")}</h2>
          {canCreatePublication && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
            >
              Actualizar horario
            </button>
          )}
        </div>
        <HorarioSemanal slots={MOCK_SLOTS}></HorarioSemanal>
      </section>

      {selectedPost && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          type="venta"
          title={selectedPost.title}
          price={selectedPost.price}
          description={selectedPost.description}
          imageUrl={selectedPost.images[0] ?? ""}
          likes={0}
          sellerName={userName}
          sellerRating={userRating}
          sellerImageUrl={userImageUrl}
          isSaved={isSaved}
          onToggleSave={() => setIsSaved((prev) => !prev)}
          onAcordarCompra={() => console.log("acordar compra")}
        />
      )}
    </>
  );
}
