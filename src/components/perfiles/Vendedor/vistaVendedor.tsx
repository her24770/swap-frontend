"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import { useAuthStore } from "../../../store/authStore";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import { CrearAnuncioForm } from "../../ui/Modal/CrearAnuncio/CrearAnuncioForm";
import type { Anuncio } from "../../../types/anuncio";
import type { TipoPublicacion } from "../../../schemas/zodSchemas";
import type { CatalogPost } from "./catalogoVendedor";
import { useCatalogoVendedor } from "./useCatalogoVendedor";
import { useAnunciosVendedor } from "./useAnunciosVendedor";
import AnunciosSection from "./AnunciosSection";
import MaterialSection from "./MaterialSection";
import NegocioSection from "./NegocioSection";
import PerfilModal from "./PerfilModal";

interface VistaVendedorProps {
  userId?: number;
  userName?: string;
  userRating?: number;
  userImageUrl?: string;
  soloLectura?: boolean;
}

export default function VistaVendedor({
  userId,
  userName = "Usuario de SWAP",
  userRating = 0,
  userImageUrl,
  soloLectura = false,
}: VistaVendedorProps = {}) {
  const t = useTranslations("perfil");
  const authUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const idUsuario = userId ?? authUserId;
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();

  const catalogo = useCatalogoVendedor(idUsuario);
  const anuncios = useAnunciosVendedor(idUsuario!);

  const [crearOpen, setCrearOpen] = useState(false);
  const [crearTipoPublicacion, setCrearTipoPublicacion] = useState<TipoPublicacion>("material");
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  const [anuncioModalOpen, setAnuncioModalOpen] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);

  const abrirCrear = (tipo: TipoPublicacion) => {
    setCrearTipoPublicacion(tipo);
    setCrearOpen(true);
  };

  const abrirEdicion = (pub: CatalogPost) => {
    setPostEditando(pub);
    setEditOpen(true);
  };

  const cerrarEdicion = () => {
    setEditOpen(false);
    setPostEditando(null);
  };

  const cerrarAnuncioModal = () => {
    setAnuncioModalOpen(false);
    setAnuncioEditando(null);
  };

  return (
    <>
      <AnunciosSection
        anuncios={anuncios.data}
        loading={anuncios.loading}
        error={anuncios.error}
        canCreate={canCreatePublication}
        onCrear={() => {
          setAnuncioEditando(null);
          setAnuncioModalOpen(true);
        }}
        onEditar={(anuncio) => {
          setAnuncioEditando(anuncio);
          setAnuncioModalOpen(true);
        }}
        onEliminar={anuncios.handleEliminarAnuncio}
      />

      <MaterialSection
        posts={catalogo.catalogMaterial}
        setPosts={catalogo.setCatalogMaterial}
        loading={catalogo.loading}
        error={catalogo.error}
        soloLectura={soloLectura}
        canCreate={canCreatePublication}
        onCrear={() => abrirCrear("material")}
        onPinChange={catalogo.handlePinChangeMaterial}
        onEditar={abrirEdicion}
        onEliminar={catalogo.handleEliminar}
        onDetalles={setSelectedPost}
      />

      <NegocioSection
        posts={catalogo.catalogNegocio}
        setPosts={catalogo.setCatalogNegocio}
        loading={catalogo.loading}
        error={catalogo.error}
        soloLectura={soloLectura}
        canCreate={canCreatePublication}
        onCrear={() => abrirCrear("negocio")}
        onPinChange={catalogo.handlePinChangeNegocio}
        onEditar={abrirEdicion}
        onEliminar={catalogo.handleEliminar}
        onDetalles={setSelectedPost}
      />

      {canCreatePublication && crearOpen && (
        <PerfilModal ariaLabel={t("modal.createPublicationAria")} onClose={() => setCrearOpen(false)}>
          <CrearPublicacionForm
            mode="crear"
            tipoPublicacion={crearTipoPublicacion}
            onCancel={() => setCrearOpen(false)}
            onSuccess={() => {
              setCrearOpen(false);
              catalogo.fetchPublicaciones();
            }}
          />
        </PerfilModal>
      )}

      {canEditCards && editOpen && postEditando && (
        <PerfilModal ariaLabel={t("modal.editPublicationAria")} onClose={() => setEditOpen(false)}>
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
            onCancel={cerrarEdicion}
            onSuccess={() => {
              cerrarEdicion();
              catalogo.fetchPublicaciones();
            }}
          />
        </PerfilModal>
      )}

      {canCreatePublication && anuncioModalOpen && (
        <PerfilModal
          ariaLabel={anuncioEditando ? t("modal.editAdAria") : t("modal.createAdAria")}
          onClose={cerrarAnuncioModal}
        >
          <CrearAnuncioForm
            anuncio={anuncioEditando} // Pasa el objeto si es edición, o null si es nuevo
            onCancelar={cerrarAnuncioModal}
            onAnuncioProcesado={() => {
              cerrarAnuncioModal();
              anuncios.refetch(); // Refresca exclusivamente la data multimedia de R2
            }}
          />
        </PerfilModal>
      )}

      {selectedPost && (
        <DetallePublicacion
          soloLectura={soloLectura}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onEliminada={catalogo.fetchPublicaciones}
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
        />
      )}
    </>
  );
}