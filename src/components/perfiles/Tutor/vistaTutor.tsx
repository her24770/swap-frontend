"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../store/authStore";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import type { CatalogPost } from "../Vendedor/catalogoVendedor";
import PerfilModal from "../Vendedor/PerfilModal";
import { useCatalogoTutor } from "./useCatalogoTutor";
import { useHorarioTutor } from "./useHorarioTutor";
import TutoriasSection from "./TutoriasSection";
import HorarioSection from "./HorarioSection";

interface VistaTutorProps {
  userId?: number;
  userName?: string;
  userRating?: number;
  userImageUrl?: string;
  soloLectura?: boolean;
}

export default function VistaTutor({
  userId,
  userName = "Usuario de SWAP",
  userRating = 0,
  userImageUrl,
  soloLectura = false,
}: VistaTutorProps = {}) {
  const t = useTranslations("perfil");
  const authUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const idUsuario = userId ?? authUserId;
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();

  const catalogo = useCatalogoTutor(idUsuario);
  const horario = useHorarioTutor(idUsuario);

  const [crearOpen, setCrearOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);

  const cerrarEdicion = () => {
    setEditOpen(false);
    setPostEditando(null);
  };

  return (
    <>
      <TutoriasSection
        posts={catalogo.catalogTutorias}
        setPosts={catalogo.setCatalogTutorias}
        loading={catalogo.loading}
        error={catalogo.error}
        soloLectura={soloLectura}
        canCreate={canCreatePublication}
        onCrear={() => setCrearOpen(true)}
        onPinChange={catalogo.handlePinChange}
        onEditar={(pub) => {
          setPostEditando(pub);
          setEditOpen(true);
        }}
        onEliminar={catalogo.handleEliminar}
        onDetalles={setSelectedPost}
      />

      <hr className="perfil-page__divider" />

      {canCreatePublication && crearOpen && (
        <PerfilModal ariaLabel={t("modal.createPublicationAria")} onClose={() => setCrearOpen(false)}>
          <CrearPublicacionForm
            mode="crear"
            tipoPublicacion="tutoria"
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
              titulo:           postEditando.title,
              descripcion:      postEditando.description,
              precio:           String(postEditando.price),
              tipo_publicacion: "tutoria",
              categorias:       postEditando.categorias,
              destacado:        postEditando.isPinned,
              estado:           postEditando.estado as "disponible" | "vendido" | "reservado",
            }}
            onCancel={cerrarEdicion}
            onSuccess={() => {
              cerrarEdicion();
              catalogo.fetchPublicaciones();
            }}
          />
        </PerfilModal>
      )}

      <HorarioSection horario={horario} canEdit={canCreatePublication} />

      {selectedPost && (
        <DetallePublicacion
          soloLectura={soloLectura}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          type="tutoria"
          title={selectedPost.title}
          price={selectedPost.price}
          description={selectedPost.description}
          imageUrl={selectedPost.images[0] ?? ""}
          likes={0}
          publicacionId={selectedPost.id}
          sellerName={userName}
          sellerRating={userRating}
          sellerImageUrl={userImageUrl}
          estado={selectedPost.estado}
        />
      )}
    </>
  );
}
