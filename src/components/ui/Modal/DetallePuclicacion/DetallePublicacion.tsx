"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { X, Bookmark, Loader2, ChevronRight, Flag } from "lucide-react";
import { UserCircle2 } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { useGuardados } from "../../../../hooks/useGuardados";
import EstadoTag from "../../../posts/PostCard/EstadoTag/EstadoTag";
import type { EstadoOpcion } from "../../../../hooks/useEstados";
import CarruselImagen from "./CarruselImagen/CarruselImagen";
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
  onVerCertificados?: () => void;
  onSellerClick?: (sellerId: number) => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
  showActions?: boolean;
  soloLectura?: boolean;
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
  actionsSlot,
  estado,
  estadosDisponibles = [],
  onEstadoChange,
}: PostModalProps) {
  const t = useTranslations("posts");
  const tSend = useTranslations("sendMessageModal");
  const locale = useLocale();
  const router = useRouter();
  const guardados = useGuardados();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const [saving, setSaving] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [solicitudTutoriaAbierta, setSolicitudTutoriaAbierta] = useState(false);
  const [reportePublicacionAbierto, setReportePublicacionAbierto] = useState(false);

  if (!isOpen) return null;

  const esPropiaPublicacion = Boolean(
    idUsuarioActual != null && sellerId != null && sellerId === idUsuarioActual,
  );

  const carouselImages = buildCarouselImageUrls(imagenes, images, imageUrl);

  const MAX_STARS = 5;
  const guardada = publicacionId ? guardados.isSaved(publicacionId) : isSaved;
  const normalizedImageUrl = useMemo(
    () => carouselImages[0] ?? normalizeImageUrl(imageUrl ?? ""),
    [carouselImages, imageUrl],
  );

  const handleToggleSave = async () => {
    if (saving) return;
    if (!publicacionId) { onToggleSave?.(); return; }
    try {
      setSaving(true);
      if (guardada) {
        await guardados.eliminarGuardado(publicacionId);
      } else {
        await guardados.guardarPublicacion(publicacionId);
      }
      onToggleSave?.();
    } catch (error) {
      console.error("Error al actualizar guardado:", error);
    } finally {
      setSaving(false);
    }
  };

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
      recipient: sellerName,
      sellerId: String(sellerId),
      postId: String(publicacionId),
      postTitle: title,
      postPrice: String(price),
      postDescription: description,
      postImageUrl: normalizedImageUrl,
      postType: type,
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
            <div className="post-modal__top">
              <button
                type="button"
                className={`post-modal__seller${onSellerClick && sellerId ? " post-modal__seller--clickable" : ""}`}
                onClick={() => { if (sellerId) onSellerClick?.(sellerId); }}
                disabled={!onSellerClick || !sellerId}
                aria-label={t("actions.viewProfile")}
              >
                <div className="post-modal__seller-avatar">
                  {sellerImageUrl ? (
                    <Image
                      src={sellerImageUrl}
                      alt={sellerName}
                      fill
                      className="post-modal__seller-img"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <UserCircle2 size={40} strokeWidth={1} className="post-modal__seller-placeholder" />
                  )}
                </div>
                <div className="post-modal__seller-info">
                  <span className="post-modal__seller-name">{sellerName}</span>
                  <div className="post-modal__stars">
                    {Array.from({ length: MAX_STARS }).map((_, i) => (
                      <span
                        key={i}
                        className={`post-modal__star${i < sellerRating ? " post-modal__star--filled" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </button>

              {estado !== undefined && (
                <div className="post-modal__estado">
                  <EstadoTag
                    estado={estado}
                    estadosDisponibles={estadosDisponibles}
                    onEstadoChange={onEstadoChange}
                  />
                </div>
              )}
            </div>

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

            {showActions && !soloLectura && (type === "tutoria" || (type === "venta" && !esPropiaPublicacion && !expandido)) && (
              <div className="post-modal__actions">
                {type === "venta" && !esPropiaPublicacion && !expandido && (
                  <button
                    type="button"
                    className="button button--medium button--full-width"
                    onClick={() => handleOpenMessageModal(onAcordarCompra)}
                  >
                    {t("actions.acordar")} <ChevronRight size={16} />
                  </button>
                )}
                {type === "tutoria" && (
                  <>
                    <button
                      type="button"
                      className="button button--medium button--warning button--full-width"
                      onClick={onVerCertificados}
                    >
                      {t("actions.certificado")}
                    </button>
                    {!esPropiaPublicacion && !expandido && (
                      <button
                        type="button"
                        className="button button--medium button--full-width"
                        onClick={() => handleOpenMessageModal(onSolicitarTutoria)}
                      >
                        {tSend("requestTutoring")} <ChevronRight size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="post-modal__likes">
              {!soloLectura && (
                <>
                  {!esPropiaPublicacion && publicacionId && (
                    <button
                      type="button"
                      className="post-modal__report"
                      onClick={() => setReportePublicacionAbierto(true)}
                      aria-label="Reportar publicación"
                    >
                      <Flag size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={`post-modal__save${guardada ? " post-modal__save--saved" : ""}`}
                    onClick={handleToggleSave}
                    aria-label={guardada ? t("save.removeAria") : t("save.addAria")}
                    disabled={saving}
                  >
                    {saving
                      ? <Loader2 size={18} className="post-modal__save-spinner" />
                      : <Bookmark size={18} />
                    }
                  </button>
                </>
              )}
              <span className="post-modal__likes-count">{likes}</span>
            </div>
            {!soloLectura && type === "tutoria" && (
              <>
                <button
                  type="button"
                  className="button button--medium button--warning button--full-width"
                  onClick={onVerCertificados}
                >
                  {t('actions.certificado')}
                </button>
                <button
                  type="button"
                  className="button button--medium button--full-width"
                  onClick={() => setSolicitudTutoriaAbierta(true)}
                >
                  Solicitar Tutoría <ChevronRight size={16} />
                </button>
              </>
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
    </>
  );

  if (typeof document === "undefined") return modal;

  return createPortal(modal, document.body);
}
