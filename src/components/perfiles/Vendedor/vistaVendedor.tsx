"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import PostCard from "../../posts/PostCard/PostCard";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useEstados } from "../../../hooks/useEstados";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import "../../ui/Modal/Modal.css";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import type { Tag } from "../../../types/tag";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import { CrearAnuncioForm } from "../../ui/Modal/CrearAnuncio/CrearAnuncioForm";
import { useAnunciosUsuario } from "../../../hooks/fetch/useAnunciosUsuario";
import type { Anuncio } from "../../../types/anuncio";
import { useServices } from "../../../services/context/ServiceContext";
import { usePublicacionesDestacadas } from "../../../hooks/fetch/usePublicacionesDestacadas";
import type { TipoPublicacion } from "../../../schemas/zodSchemas";
import { PerfilAdBannerSkeleton, PerfilPostCarouselSkeleton } from "../perfilLoading";

interface CatalogPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
  tipo: string;
  categorias: number[];
  isPinned: boolean;
}

interface VistaVendedorProps {
  userId?: number;
  userName?: string;
  userRating?: number;
  userImageUrl?: string;
}

export default function VistaVendedor({
  userId,
  userName = "Usuario de SWAP",
  userRating = 0,
  userImageUrl,
}: VistaVendedorProps = {}) {
  const t = useTranslations("perfil");
  const authUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const idUsuario = userId ?? authUserId;
  const estadosMaterial = useEstados("material");
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();
  const { anuncio: anuncioService, publicacion: publicacionService } = useServices();

  const [catalogMaterial, setCatalogMaterial] = useState<CatalogPost[]>([]);
  const [catalogNegocio, setCatalogNegocio] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [crearTipoPublicacion, setCrearTipoPublicacion] = useState<TipoPublicacion>("material");
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  
  const [anuncioModalOpen, setAnuncioModalOpen] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);

  const { 
    data: anunciosData, 
    loading: anunciosLoading, 
    error: anunciosError,
    refetch: refetchAnuncios 
  } = useAnunciosUsuario(idUsuario!);

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) {
      setCatalogMaterial([]);
      setCatalogNegocio([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [resMaterial, resNegocio] = await Promise.all([
        apiClient.get<PublicacionesResponse>(`/api/publicacion/user/${idUsuario}?tipo=material&all=true`),
        apiClient.get<PublicacionesResponse>(`/api/publicacion/user/${idUsuario}?tipo=negocio&all=true`)
      ]);
      
      const mapPublicaciones = (data: Publicacion[], tipoPub: string): CatalogPost[] => {
        return data.map((pub) => {
          return {
            id: pub.id_publicacion,
            title: pub.titulo,
            price: typeof pub.precio === 'string' ? parseFloat(pub.precio) : pub.precio,
            description: pub.descripcion,
            tags: mapPublicacionEtiquetasToTags(pub.etiquetas, {
              name: tipoPub === "material" ? "Material" : "Negocio",
            }),
            estado: pub.estadoRel?.estado ?? "activo",
            images: pub.imagenes?.map((img) => img.url_imagen) || [],
            tipo: tipoPub,
            categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
            isPinned: (pub as any).is_pinned ?? false,
          };
        });
      };

      // Sort: pinned first within each list
      const sortPinned = (list: CatalogPost[]) =>
        [...list].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

      setCatalogMaterial(sortPinned(mapPublicaciones(resMaterial.data, "material")));
      setCatalogNegocio(sortPinned(mapPublicaciones(resNegocio.data, "negocio")));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las publicaciones");
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  // ── MANEJO DE ELIMINACIÓN DE ANUNCIOS ────────────────────────────────────
  const handleEliminarAnuncio = useCallback((idAnuncio: number) => {
    mostrarConfirm({
      titulo: "Eliminar anuncio",
      mensaje: "¿Estás seguro de que deseas eliminar este anuncio de la plataforma? Esta acción es permanente.",
      onConfirm: async () => {
        try {
          await anuncioService.eliminarAnuncio(idAnuncio);
          agregarNotificacion({
            tipo: "success",
            mensaje: "Anuncio removido con éxito.",
          });
          refetchAnuncios(); 
        } catch (err: any) {
          agregarNotificacion({
            tipo: "error",
            mensaje: err.message || "No fue posible eliminar el anuncio.",
          });
        }
      },
    });
  }, [agregarNotificacion, refetchAnuncios, mostrarConfirm, anuncioService]);

  // ── MANEJO DE APERTURA DE MODAL DE EDICIÓN ───────────────────────────────
  const handleAbrirEdicionAnuncio = (anuncio: Anuncio) => {
    setAnuncioEditando(anuncio);
    setAnuncioModalOpen(true);
  };

  const handleEliminar = useCallback((id: number) => {
    mostrarConfirm({
      titulo: "Eliminar publicación",
      mensaje: "¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/api/publicacion/${id}`);
          agregarNotificacion({
            tipo: "success",
            mensaje: "Publicación eliminada exitosamente.",
          });
          fetchPublicaciones();
        } catch (err) {
          const apiError = err as ApiError;
          agregarNotificacion({
            tipo: "error",
            mensaje: apiError.message || "No fue posible eliminar la publicación.",
          });
        }
      },
    });
  }, [agregarNotificacion, fetchPublicaciones, mostrarConfirm]);

    // ── MANEJO DE PINNED/DESTACADO ─────────────────────────────────────────────
  const handlePinChangeMaterial = useCallback(
    (id: number, newPinned: boolean) => {
      setCatalogMaterial((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, isPinned: newPinned } : p
        );
        return [...updated].sort(
          (a, b) => Number(b.isPinned) - Number(a.isPinned)
        );
      });
    },
    []
  );

  const handlePinChangeNegocio = useCallback(
    (id: number, newPinned: boolean) => {
      setCatalogNegocio((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, isPinned: newPinned } : p
        );
        return [...updated].sort(
          (a, b) => Number(b.isPinned) - Number(a.isPinned)
        );
      });
    },
    []
  );
  
  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  return (
    <>  
      {/* ADbanners (Sección Anuncios) */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.ads")}</h2>
          {canCreatePublication && (
            <button 
              type="button" 
              className="perfil-page__new-publication-btn" 
              onClick={() => {
                setAnuncioEditando(null); 
                setAnuncioModalOpen(true);
              }}
            >
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.createAd")}
            </button>
          )}
        </div>

        {anunciosLoading && (
          <PerfilAdBannerSkeleton showActions={canCreatePublication} />
        )}

        {anunciosError && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {anunciosError}
          </p>
        )}

        {!anunciosLoading && !anunciosError && anunciosData && anunciosData.length === 0 && (
          <p className="perfil-page__coming-soon">Este estudiante aún no tiene anuncios publicados.</p>
        )}

        {!anunciosLoading && !anunciosError && anunciosData && anunciosData.length > 0 && (
          <AnunciosCarousel>
            {anunciosData.map((ad) => (
              <div key={ad.id_anuncio} className="h-carousel__item">
                <AdBanner
                  imageUrl={ad.imagen_url}
                  title={ad.titulo}
                  description={ad.descripcion}
                  onEditClick={() => handleAbrirEdicionAnuncio(ad)}
                  onDeleteClick={() => handleEliminarAnuncio(ad.id_anuncio)}
                />
              </div>
            ))}
          </AnunciosCarousel>
        )}
      </section>

      {/* Catálogo de Materiales */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalogMaterial")}</h2>
          {canCreatePublication && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
              onClick={() => {
                setCrearTipoPublicacion("material");
                setCrearOpen(true);
              }}
            >
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.newPostMaterial")}
            </button>
          )}
        </div>

        {loading && <PerfilPostCarouselSkeleton count={4} />}
        {error && <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>{error}</p>}

        {!loading && !error && catalogMaterial.length === 0 && (
          <p className="perfil-page__coming-soon">Aún no tienes publicaciones de materiales.</p>
        )}

        {!loading && !error && catalogMaterial.length > 0 && (
          <HorizontalCarousel>
            {catalogMaterial.map((pub) => (
              <div key={pub.id} className="h-carousel__item">
                <PostCard
                  publicacionId={pub.id}
                  tags={pub.tags}
                  title={pub.title}
                  price={pub.price}
                  description={pub.description}
                  images={pub.images}
                  estado={pub.estado}
                  estadosDisponibles={estadosMaterial}
                  isPinned={pub.isPinned}
                  onPinChange={(newPinned) =>
                    handlePinChangeMaterial(pub.id, newPinned)
                  }
                  onEditClick={() => {
                    setPostEditando(pub);
                    setEditOpen(true);
                  }}
                  onDeleteClick={() => handleEliminar(pub.id)}
                  onImageUpdate={(newUrl) => {
                    setCatalogMaterial((prev) =>
                      prev.map((p) =>
                        p.id === pub.id ? { ...p, images: [newUrl, ...p.images.slice(1)] } : p
                      )
                    );
                  }}
                  onEstadoChange={async (nuevoEstado) => {
                    try {
                      await apiClient.put(`/api/publicacion/${pub.id}`, { estado: nuevoEstado, etiquetas: [1] });
                      setCatalogMaterial((prev) =>
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

      {/* Catálogo de Productos/Negocios */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalogNegocio")}</h2>
          {canCreatePublication && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
              onClick={() => {
                setCrearTipoPublicacion("negocio");
                setCrearOpen(true);
              }}
            >
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.newPostNegocio")}
            </button>
          )}
        </div>

        {loading && <PerfilPostCarouselSkeleton count={4} />}
        {error && <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>{error}</p>}

        {!loading && !error && catalogNegocio.length === 0 && (
          <p className="perfil-page__coming-soon">Aún no tienes publicaciones de negocio.</p>
        )}

        {!loading && !error && catalogNegocio.length > 0 && (
          <HorizontalCarousel>
            {catalogNegocio.map((pub) => (
              <div key={pub.id} className="h-carousel__item">
                <PostCard
                  publicacionId={pub.id}
                  tags={pub.tags}
                  title={pub.title}
                  price={pub.price}
                  description={pub.description}
                  images={pub.images}
                  estado={pub.estado}
                  isPinned={pub.isPinned}
                  onPinChange={(newPinned) =>
                    handlePinChangeNegocio(pub.id, newPinned)
                  }
                  onEditClick={() => {
                    setPostEditando(pub);
                    setEditOpen(true);
                  }}
                  onDeleteClick={() => handleEliminar(pub.id)}
                  onEstadoChange={(nuevoEstado) =>
                    console.log(`Cambiar estado de ${pub.id} a: ${nuevoEstado}`)
                  }
                  onDetallesClick={() => setSelectedPost(pub)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        )}
      </section>


      {/* Modal crear publicación */}
      {canCreatePublication && crearOpen && (
        <div className="modal-overlay" onClick={() => setCrearOpen(false)}>
          <div className="perfil-page__crear-pub-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("modal.createPublicationAria")}>
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="crear"
                tipoPublicacion={crearTipoPublicacion}
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

      {/* Modal editar publicación */}
      {canEditCards && editOpen && postEditando && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div className="perfil-page__crear-pub-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("modal.editPublicationAria")}>
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="editar"
                publicacionId={postEditando.id}
                imagenesExistentes={postEditando.images}
                defaultValues={{
                  titulo: postEditando.title,
                  descripcion: postEditando.description,
                  precio: String(postEditando.price),
                  tipo_publicacion: postEditando.tipo as "material" | "tutoria" | "negocio",
                  categorias: postEditando.categorias,
                  destacado: postEditando.isPinned,
                  estado: postEditando.estado as "disponible" | "vendido" | "reservado",
                }}
                onCancel={() => {
                  setEditOpen(false);
                  setPostEditando(null);
                }}
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

      {canCreatePublication && anuncioModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setAnuncioModalOpen(false);
            setAnuncioEditando(null);
          }}
        >
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={anuncioEditando ? "Editar anuncio" : t("modal.createAdAria")}
          >
            <div className="perfil-page__crear-pub-modal-content">
              <CrearAnuncioForm
                anuncio={anuncioEditando} // Pasa el objeto si es edición, o null si es nuevo
                onCancelar={() => {
                  setAnuncioModalOpen(false);
                  setAnuncioEditando(null);
                }}
                onAnuncioProcesado={() => {
                  setAnuncioModalOpen(false);
                  setAnuncioEditando(null);
                  refetchAnuncios(); // Refresca exclusivamente la data multimedia de R2
                }}
              />
            </div>
          </div>
        </div>
      )}  

      {selectedPost && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          type={selectedPost.tipo === "tutoria" ? "tutoria" : "venta"}
          title={selectedPost.title}
          price={selectedPost.price}
          description={selectedPost.description}
          imageUrl={selectedPost.images[0] ?? ""}
          images={selectedPost.images}
          tags={selectedPost.tags.map(t => ({
            id: t.id,
            name: t.name
          }))}
          
          likes={0}
          publicacionId={selectedPost.id}
          sellerName={userName}
          sellerRating={userRating}
          sellerId={userId}
          sellerImageUrl={userImageUrl}
          estado={selectedPost.estado}
          onAcordarCompra={() => console.log("acordar compra")}
        />
      )}
    </>
  );
}