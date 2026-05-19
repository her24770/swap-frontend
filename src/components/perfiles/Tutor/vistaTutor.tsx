"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import PostCard from "../../posts/PostCard/PostCard";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import HorarioSemanal, { EstadoHorario } from "./Horario/Horario";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import "../../ui/Modal/Modal.css";
import imagePath from "../../../../public/images/uvg.jpg";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import type { Tag } from "../../../types/tag";

interface CatalogPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
}

interface EspaciosHorario {
  dia: string;
  hora: number;
  estado: EstadoHorario;
}

const MOCK_CATALOG: CatalogPost[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Porción pastel",
  price: 15,
  description: "Media porción de pastel de chocolate hecho en casa.",
  tags: [{ id: 3, name: "Negocio", colorKey: "diseno" }],
  estado: i % 3 === 0 ? "vendido" : "activo",
  images: [imagePath.src],
}));

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


export default function VistaTutor() {
  const t = useTranslations("perfil");
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();

  const [crearOpen, setCrearOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
        <HorizontalCarousel>
          {MOCK_CATALOG.map((pub) => (
            <div key={pub.id} className="h-carousel__item">
              <PostCard
                tags={pub.tags}
                title={pub.title}
                price={pub.price}
                description={pub.description}
                images={pub.images}
                estado={pub.estado}
                onEditClick={() => {
                  setPostEditando(pub);
                  setEditOpen(true);
                }}
                onEstadoChange={(nuevoEstado) =>
                  console.log(`Cambiar estado de ${pub.id} a: ${nuevoEstado}`)
                }
                onDetallesClick={() => setSelectedPost(pub)}
              />
            </div>
          ))}
        </HorizontalCarousel>
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
                onSuccess={() => setCrearOpen(false)}
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
                  categorias:       postEditando.tags.map((tag) => tag.id),
                  destacado:        false,
                  estado:           postEditando.estado as "disponible" | "vendido" | "reservado",
                }}
                onCancel={() => { setEditOpen(false); setPostEditando(null); }}
                onSuccess={() => { setEditOpen(false); setPostEditando(null); }}
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
