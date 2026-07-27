"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Bookmark, Loader2, ChevronRight } from "lucide-react";
import { UserCircle2 } from "lucide-react";
import { useGuardados } from "../../../../hooks/useGuardados";
import EstadoTag from "../../../posts/PostCard/EstadoTag/EstadoTag";
import type { EstadoOpcion } from "../../../../hooks/useEstados";
import CarruselImagen from "./CarruselImagen/CarruselImagen";
import "../../Button/Button.css";
import "../Modal.css";
import "./DetallePublicacion.css";
import TagBadge from "../../TagBadge/TagBadge";
import type { Tag } from "../../../../types/tag";
import type { ImagenPublicacion } from "../../../../types/publicacion";
import { normalizeImageUrl } from "../../../../lib/imageUrl";
import { useTranslations } from "next-intl";
import ModalSolicitudTutoria from "../Solicitud/Tutoria/SolicitudTutoriaModal"
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

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
  estado,
  estadosDisponibles = [],
  onEstadoChange,
}: PostModalProps) {
  const t = useTranslations("posts");
  const guardados = useGuardados();
  const [saving, setSaving] = useState(false);
  const [solicitudTutoriaAbierta, setSolicitudTutoriaAbierta] = useState(false);

  if (!isOpen) return null;

  const carouselImages = buildCarouselImageUrls(imagenes, images, imageUrl);

  const MAX_STARS = 5;
  const guardada = publicacionId ? guardados.isSaved(publicacionId) : isSaved;

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

  const modal = (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>

        <button
          type="button"
          className="post-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* ── Vendedor + estado ── */}
        <div className="post-modal__top">
          <button
            type="button"
            className={`post-modal__seller${onSellerClick && sellerId ? " post-modal__seller--clickable" : ""}`}
            onClick={() => { if (sellerId) onSellerClick?.(sellerId); }}
            disabled={!onSellerClick || !sellerId}
            aria-label={`Ver perfil de ${sellerName}`}
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

        {/* ── Tags ── */}
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

        {/* ── Descripción ── */}
        <p className="post-modal__description">{description}</p>

        {showActions && (
          <div className="post-modal__actions">
            {type === "venta" && (
              <button
                type="button"
                className="button button--medium button--full-width"
                onClick={onAcordarCompra}
              >
                {t('actions.acordar')} <ChevronRight size={16} />
              </button>
            )}
            {type === "tutoria" && (
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
        )}

        <div className="post-modal__likes">
          <button
            type="button"
            className={`post-modal__save${guardada ? " post-modal__save--saved" : ""}`}
            onClick={handleToggleSave}
            aria-label={guardada ? "Eliminar de guardados" : "Guardar publicación"}
            disabled={saving}
          >
            {saving
              ? <Loader2 size={18} className="post-modal__save-spinner" />
              : <Bookmark size={18} />
            }
          </button>
          <span className="post-modal__likes-count">{likes}</span>
        </div>

      </div>
    </div>
    <ModalSolicitudTutoria
      isOpen={solicitudTutoriaAbierta}
      tituloTutoria={title}
      onClose={() => setSolicitudTutoriaAbierta(false)}
      onSubmit={() => setSolicitudTutoriaAbierta(false)}
    />
    </>
  );

  if (typeof document === "undefined") return modal;

  return createPortal(modal, document.body);
}
