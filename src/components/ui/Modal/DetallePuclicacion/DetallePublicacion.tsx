"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import type { EstadoOpcion } from "../../../../hooks/useEstados";
import CarruselImagen from "./CarruselImagen/CarruselImagen";
import VendedorHeader from "./VendedorHeader";
import BarraLikes from "./BarraLikes";
import AccionesContacto from "./AccionesContacto";
import AccionesModerador from "./AccionesModerador";
import { useAccionesModerador } from "./useAccionesModerador";
import EnviarMensajePanel, { TipoPublicacionMensaje } from "../EnviarMensaje/EnviarMensaje";
import "../../Button/Button.css";
import "../Modal.css";
import "./DetallePublicacion.css";
import TagBadge from "../../TagBadge/TagBadge";
import type { Tag } from "../../../../types/tag";
import type { ImagenPublicacion } from "../../../../types/publicacion";
import { normalizeImageUrl } from "../../../../lib/imageUrl";
import ModalSolicitudTutoria from "../Solicitud/Tutoria/SolicitudTutoriaModal"
import ReporteModal from "../Reporte/ReporteModal";
import JustificanteModeracionModal from "../Reporte/JustificanteModeracionModal";

export type DetallePublicacionType = "venta" | "tutoria";

function buildCarouselImageUrls(
  imagenes?: ImagenPublicacion[],
  images?: string[],
  imageUrl?: string,
): string[] {
  if (imagenes?.length) {
    return imagenes.map((img) => normalizeImageUrl(img.url_imagen)).filter(Boolean);
  }
  const fromImages = images?.map(normalizeImageUrl).filter(Boolean) ?? [];
  if (fromImages.length > 0) {
    return Array.from(new Set(fromImages));
  }
  return imageUrl ? [normalizeImageUrl(imageUrl)] : [];
}

interface PostModalProps {
  isOpen?: boolean;
  onClose: () => void;
  type: DetallePublicacionType;
  title: string;
  price: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  imagenes?: ImagenPublicacion[];
  tags?: Tag[];
  likes?: number;
  publicacionId?: number;
  sellerName: string;
  sellerRating: number;
  sellerId?: number;
  sellerImageUrl?: string;
  estado?: string | number;
  estadosDisponibles?: EstadoOpcion[];
  onEstadoChange?: (nuevoEstado: string) => void;
  onAcordarCompra?: () => void;
  onSolicitarTutoria?: () => void;
  onVerCertificados?: (sellerId: number) => void;
  onSellerClick?: (sellerId: number) => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
  showActions?: boolean;
  soloLectura?: boolean;
  onEliminada?: () => void;
  actionsSlot?: ReactNode;
}

export default function DetallePublicacion({
  isOpen = true,
  onClose,
  type,
  title,
  price,
  description,
  images = [],
  imageUrl,
  imagenes,
  tags = [],
  likes = 0,
  publicacionId,
  sellerName,
  sellerRating,
  sellerId,
  sellerImageUrl,
  onAcordarCompra,
  onSolicitarTutoria,
  onVerCertificados,
  onSellerClick,
  onToggleSave,
  isSaved = false,
  showActions = true,
  soloLectura = false,
  onEliminada,
  actionsSlot,
  estado,
  estadosDisponibles = [],
  onEstadoChange,
}: PostModalProps) {
  const tSend = useTranslations("sendMessageModal");
  const tReporte = useTranslations("reporte");
  const tModeracion = useTranslations("moderacion.publicaciones");
  const locale = useLocale();
  const router = useRouter();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [solicitudTutoriaAbierta, setSolicitudTutoriaAbierta] = useState(false);
  const [reportePublicacionAbierto, setReportePublicacionAbierto] = useState(false);
  const moderador = useAccionesModerador({ sellerId, publicacionId, onClose, onEliminada });

  if (!isOpen) return null;

  const esPropiaPublicacion = Boolean(
    idUsuarioActual != null && sellerId != null && sellerId === idUsuarioActual,
  );

  const carouselImages = buildCarouselImageUrls(imagenes, images, imageUrl);
  const normalizedImageUrl = carouselImages[0] ?? normalizeImageUrl(imageUrl ?? "");

  const handleOpenMessageModal = (callback?: () => void) => {
    if (esPropiaPublicacion) return;
    callback?.();
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = (mensaje: string) => {
    if (!sellerId || !publicacionId || esPropiaPublicacion) return;

    setIsSendingMessage(true);

    const params = new URLSearchParams({
      compose: "1",
      sellerId: String(sellerId),
      postId: String(publicacionId),
      message: mensaje,
    });

    setIsMessageModalOpen(false);
    onClose();
    router.push(`/${locale}/Chat?${params.toString()}`);
  };

  const expandido = isMessageModalOpen && Boolean(sellerId && publicacionId);

  const modal = (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`post-modal${expandido ? " post-modal--expanded" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="post-modal__close"
          onClick={onClose}
          aria-label={tSend("close")}
        >
          <X size={20} />
        </button>

        <div className="post-modal__body">
          <div className="post-modal__detail">
            <VendedorHeader
              sellerName={sellerName}
              sellerRating={sellerRating}
              sellerId={sellerId}
              sellerImageUrl={sellerImageUrl}
              onSellerClick={onSellerClick}
              estado={estado}
              estadosDisponibles={estadosDisponibles}
              onEstadoChange={onEstadoChange}
            />

            <div className="post-modal__carousel">
              <CarruselImagen images={carouselImages} altText={title} />
            </div>

            {tags.length > 0 && (
              <div className="post-modal__tags">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}

            <div className="post-modal__price-row">
              <h2 className="post-modal__title">{title}</h2>
              <span className="post-modal__price">Q{price}</span>
            </div>

            <p className="post-modal__description">{description}</p>

            {actionsSlot && (
              <div className="post-modal__actions">
                {actionsSlot}
              </div>
            )}

            <AccionesContacto
              type={type}
              showActions={showActions}
              soloLectura={soloLectura}
              esPropiaPublicacion={esPropiaPublicacion}
              expandido={expandido}
              sellerId={sellerId}
              onAcordarCompra={onAcordarCompra}
              onSolicitarTutoria={onSolicitarTutoria}
              onVerCertificados={onVerCertificados}
              onAbrirMensaje={handleOpenMessageModal}
            />

            <BarraLikes
              likes={likes}
              soloLectura={soloLectura}
              esPropiaPublicacion={esPropiaPublicacion}
              publicacionId={publicacionId}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
              onReportar={() => setReportePublicacionAbierto(true)}
            />

            {soloLectura && (
              <AccionesModerador
                publicacionId={publicacionId}
                sellerId={sellerId}
                ocultarEliminar={Boolean(actionsSlot)}
                onReportar={() => setReportePublicacionAbierto(true)}
                onAdvertir={() => moderador.setAdvertenciaAbierta(true)}
                onEliminar={() => moderador.setEliminarAbierto(true)}
              />
            )}
          </div>

          {expandido && (
            <div className="post-modal__message-panel">
              <EnviarMensajePanel
                onClose={() => {
                  setIsMessageModalOpen(false);
                  setIsSendingMessage(false);
                }}
                destinatarioNombre={sellerName}
                publicacion={{
                  id: publicacionId!,
                  titulo: title,
                  precio: price,
                  descripcion: description,
                  imagenUrl: normalizedImageUrl,
                  tipo: type as TipoPublicacionMensaje,
                }}
                onEnviar={handleSendMessage}
                isSending={isSendingMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    <ModalSolicitudTutoria
      isOpen={solicitudTutoriaAbierta}
      tituloTutoria={title}
      onClose={() => setSolicitudTutoriaAbierta(false)}
      onSubmit={() => setSolicitudTutoriaAbierta(false)}
    />
    {publicacionId && (
      <ReporteModal
        isOpen={reportePublicacionAbierto}
        tipoObjetivo="publicacion"
        idObjetivo={publicacionId}
        onClose={() => setReportePublicacionAbierto(false)}
      />
    )}
    <JustificanteModeracionModal
      isOpen={moderador.advertenciaAbierta}
      tipoObjetivo="usuario"
      titulo={tReporte("moderador.advertenciaTitulo")}
      pregunta={tReporte("moderador.advertenciaPregunta")}
      enviando={moderador.enviandoAdvertencia}
      onClose={() => moderador.setAdvertenciaAbierta(false)}
      onSubmit={moderador.handleAdvertenciaModerador}
    />
    <JustificanteModeracionModal
      isOpen={moderador.eliminarAbierto}
      tipoObjetivo="publicacion"
      titulo={tModeracion("justificante.titulos.eliminar")}
      pregunta={tModeracion("justificante.preguntas.eliminar")}
      enviando={moderador.eliminando}
      onClose={() => moderador.setEliminarAbierto(false)}
      onSubmit={moderador.handleEliminarModerador}
    />
    </>
  );

  if (typeof document === "undefined") return modal;

  return createPortal(modal, document.body);
}
