"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import PostCard from "../../posts/PostCard/PostCard";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useEstados } from "../../../hooks/useEstados";
import { useAuthStore } from "../../../store/authStore";
import "../../ui/Modal/Modal.css";
import imagePath from "../../../../public/images/uvg.jpg";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import type { Tag } from "../../../types/tag";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";

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
}

const MOCK_AD = {
  imageUrl: imagePath.src,
  title: "2x1 en porción de pasteles",
  subtitle: "¡Oferta por tiempo limitado!",
};

export default function VistaVendedor() {
  const t = useTranslations("perfil");
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);
  const estadosMaterial = useEstados("material");

  const [catalogMaterial, setCatalogMaterial] = useState<CatalogPost[]>([]);
  const [catalogNegocio, setCatalogNegocio] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) return;
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
            tags: tipoPub === "material"
              ? [{ id: 3, name: "Material", colorKey: "diseno" }]
              : [{ id: 4, name: "Negocio", colorKey: "negocio" }],
            estado: pub.estadoRel?.estado ?? "activo",
            images: pub.imagenes?.map((img) => img.url_imagen) || [],
            tipo: tipoPub,
            categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
          };
        });
      };
      setCatalogMaterial(mapPublicaciones(resMaterial.data, "material"));
      setCatalogNegocio(mapPublicaciones(resNegocio.data, "negocio"));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las publicaciones");
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
      {/* Catálogo de Materiales con carrusel de cards */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalogMaterial")}</h2>
          <button
            type="button"
            className="perfil-page__new-publication-btn"
            onClick={() => setCrearOpen(true)}
          >
            <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
            {t("actions.newPublication")}
          </button>
        </div>

        {loading && (
          <p className="perfil-page__coming-soon">Cargando publicaciones...</p>
        )}

        {error && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {error}
          </p>
        )}

        {!loading && !error && catalogMaterial.length === 0 && (
          <p className="perfil-page__coming-soon">
            Aún no tienes publicaciones de negocio.
          </p>
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
                  canEdit={true}
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

      {/* Catálogo de productos con carrusel de cards */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalogNegocio")}</h2>
          <button
            type="button"
            className="perfil-page__new-publication-btn"
            onClick={() => setCrearOpen(true)}
          >
            <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
            {t("actions.newPublication")}
          </button>
        </div>

        {loading && (
          <p className="perfil-page__coming-soon">Cargando publicaciones...</p>
        )}

        {error && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {error}
          </p>
        )}

        {!loading && !error && catalogNegocio.length === 0 && (
          <p className="perfil-page__coming-soon">
            Aún no tienes publicaciones de negocio.
          </p>
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
                  canEdit={true}
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

      <hr className="perfil-page__divider" />

      {/* ADbanners */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.ads")}</h2>
          <button type="button" className="perfil-page__new-publication-btn">
            {t("actions.changeAd")}
          </button>
        </div>
        <AdBanner
          imageUrl={MOCK_AD.imageUrl}
          title={MOCK_AD.title}
          subtitle={MOCK_AD.subtitle}
        />
      </section>

      {/* Modal crear publicación */}
      {crearOpen && (
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

      {/* Modal editar publicación */}
      {editOpen && postEditando && (
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
                  titulo: postEditando.title,
                  descripcion: postEditando.description,
                  precio: String(postEditando.price),
                  tipo_publicacion: postEditando.tipo as "material" | "tutoria" | "negocio",
                  categorias: postEditando.categorias,
                  destacado: false,
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
          sellerName="Usuario de SWAP"
          sellerRating={0}
          isSaved={isSaved}
          onToggleSave={() => setIsSaved((prev) => !prev)}
          onAcordarCompra={() => console.log("acordar compra")}
        />
      )}
    </>
  );
}