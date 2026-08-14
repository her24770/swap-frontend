"use client";

import { useRef, useState, useEffect } from "react";
import { Bookmark, Camera, ChevronRight, Heart, Loader2, Pin, PinOff, SquarePen, Trash2} from "lucide-react";
import { useTranslations } from "next-intl";
import TagBadge from "../../ui/TagBadge/TagBadge";
import PostImage from "./PostImage/PostImage";
import EstadoTag from "./EstadoTag/EstadoTag";
import { imagenService } from "../../../services/imagenService";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { useGuardados } from "../../../hooks/useGuardados";
import { useLike } from "../../../hooks/useLike";
import { useUIStore } from "../../../store/uiStore";
import { apiClient } from "../../../lib/apiClient";
import "../../ui/Button/Button.css";
import "./PostCard.css";
import type { Tag } from "../../../types/tag";
import type { EstadoOpcion } from "../../../hooks/useEstados";

interface PostCardProps {
  title: string;
  price: number;
  description: string;
  images: string[];
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
  publicacionId?: number;
  estado?: string | number;
  estadosDisponibles?: EstadoOpcion[];
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onImageUpdate?: (newUrl: string) => void;
  onEstadoChange?: (nuevoEstado: string) => void;
  onDetallesClick?: () => void;
  modoGuardado?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void | Promise<void>;
  initialLikeado?: boolean;
  initialLikes?: number;
  isPinned?: boolean;
  onPinChange?: (newPinned: boolean) => void;
  categorias?: number[];
  soloLectura?: boolean;
}

export default function PostCard({
  title,
  price,
  description,
  images,
  tags,
  onTagClick,
  publicacionId,
  estado,
  estadosDisponibles = [],
  onEditClick,
  onDeleteClick,
  onImageUpdate,
  onEstadoChange,
  onDetallesClick,
  modoGuardado = false,
  isSaved,
  onToggleSave,
  initialLikeado = false,
  initialLikes = 0,
  isPinned = false,
  onPinChange,
  soloLectura = false,
}: PostCardProps) {
  const t = useTranslations("posts");
  const { canEditCards } = usePerspectivaInterna();
  const guardados = useGuardados();
  const { mostrarConfirm, agregarNotificacion } = useUIStore();

  const [displayImages, setDisplayImages] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinned, setPinned] = useState(isPinned);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guardada = isSaved ?? (publicacionId !== undefined && guardados.isSaved(publicacionId));
  const visuallySaved = modoGuardado || guardada;
  const { likeado, count, toggleLike, loading: likeLoading } = useLike(
    publicacionId ?? 0,
    initialLikeado,
    initialLikes
  );

  // Sync pinned state if parent prop changes
  useEffect(() => {
    setPinned(isPinned);
  }, [isPinned]);

  useEffect(() => {
    setDisplayImages(images);
  }, [images]);

  const handleDetailsClick = () => {
    if (onDetallesClick) {
      onDetallesClick();
    }
  };

  const handleToggleSave = async () => {
    if (publicacionId === undefined || isSaving) return;

    try {
      setIsSaving(true);
      if (onToggleSave) {
        await onToggleSave();
        return;
      }

      if (guardada) {
        await guardados.eliminarGuardado(publicacionId);
      } else {
        await guardados.guardarPublicacion(publicacionId);
      }
    } catch (err) {
      const error = err as Error;
      agregarNotificacion({
        tipo: "error",
        mensaje: error.message || "No fue posible actualizar el guardado.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = () => {
    if (publicacionId === undefined || isPinning) return;

    const nextPinned = !pinned;
    const titulo = nextPinned ? "Destacar publicación" : "Quitar de destacados";
    const mensaje = nextPinned
      ? "¿Deseas destacar esta publicación? Aparecerá en la parte superior de tu catálogo. Solo puedes tener 3 publicaciones destacadas por tipo."
      : "¿Deseas quitar esta publicación de destacados?";

    mostrarConfirm({
      titulo,
      mensaje,
      onConfirm: async () => {
        try {
          setIsPinning(true);
          await apiClient.patch(`/api/publicacion/${publicacionId}/destacar`, {
            destacar: nextPinned,
          });
          setPinned(nextPinned);
          onPinChange?.(nextPinned);
          agregarNotificacion({
            tipo: "success",
            mensaje: nextPinned
              ? "Publicación destacada exitosamente."
              : "Publicación quitada de destacados.",
          });
        } catch (err: any) {
          agregarNotificacion({
            tipo: "error",
            mensaje: err.message || "No fue posible actualizar el estado de destacado.",
          });
        } finally {
          setIsPinning(false);
        }
      },
    });
  };

  const uploadImage = async (file: File) => {
    if (publicacionId === undefined) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const { urlsNuevas } = await imagenService.actualizarPublicacion(publicacionId, { imagenes: [file] });
      const urlConBuster = urlsNuevas[0] ? `${urlsNuevas[0]}?t=${Date.now()}` : undefined;
      if (urlConBuster) setDisplayImages((prev) => [...prev, urlConBuster]);
      onImageUpdate?.(urlConBuster);
      agregarNotificacion({
        tipo: "success",
        mensaje: "La imagen de la publicación fue actualizada exitosamente.",
      });
    } catch (err) {
      const error = err as Error;
      const message = error.message || t("uploadErrors.generic");
      setUploadError(message);
      agregarNotificacion({ tipo: "error", mensaje: message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || publicacionId === undefined) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      const message = t("uploadErrors.invalidType");
      setUploadError(message);
      agregarNotificacion({ tipo: "error", mensaje: message });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const message = t("uploadErrors.tooLarge");
      setUploadError(message);
      agregarNotificacion({ tipo: "error", mensaje: message });
      return;
    }

    mostrarConfirm({
      titulo: "Actualizar imagen",
      mensaje: "¿Deseas reemplazar la imagen de esta publicación?",
      onConfirm: () => {
        void uploadImage(file);
      },
    });
  };

  return (
    <article
      className={[
        "post-card",
        modoGuardado || guardada ? "post-card--saved" : "",
        pinned ? "post-card--pinned" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="post-card__header">
        {estado !== undefined && (
          <div className="post-card__estado-tag-container">
            <EstadoTag
              estado={estado}
              estadosDisponibles={estadosDisponibles}
              onEstadoChange={onEstadoChange}
            />
          </div>
        )}

        <div className="post-card__header-actions">
          {/* Pin/Destacar button — only visible in own profile edit mode */}
          {canEditCards && publicacionId !== undefined && (
            <button
              type="button"
              className={`post-card__pin-button${pinned ? " post-card__pin-button--pinned" : ""}`}
              onClick={handleTogglePin}
              disabled={isPinning}
              aria-label={pinned ? "Quitar de destacados" : "Destacar publicación"}
              title={pinned ? "Quitar de destacados" : "Destacar publicación"}
            >
              {isPinning ? (
                <Loader2 size={20} className="post-card__upload-spinner" />
              ) : pinned ? (
                <PinOff size={20} strokeWidth={2} />
              ) : (
                <Pin size={20} strokeWidth={2} />
              )}
            </button>
          )}

          {canEditCards && onEditClick && (
            <button
              type="button"
              className="post-card__edit-button"
              onClick={onEditClick}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
            >
              <SquarePen size={24} strokeWidth={2} />
            </button>
          )}
          
          {canEditCards && onDeleteClick && (
            <button
              type="button"
              className="post-card__delete-button"
              onClick={onDeleteClick}
              aria-label="Eliminar publicación"
              title="Eliminar publicación"
            >
              <Trash2 size={24} strokeWidth={2} />
            </button>
          )}

        </div>
      </header>

      <div className="post-card__media">
        <div className="post-card__image-wrapper">
          <PostImage images={displayImages} alt={title} />
          {canEditCards && publicacionId !== undefined && (
            <>
              <div
                className="post-card__upload-overlay"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                aria-label={t("aria.uploadImage")}
              >
                {isUploading
                  ? <Loader2 size={28} className="post-card__upload-spinner" />
                  : <Camera size={28} />
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>
        {uploadError && (
          <p className="post-card__upload-error">{uploadError}</p>
        )}
      </div>

      <div className="post-card__content">
        <div className="post-card__info">
          <h3 className="post-card__title">{title}</h3>
          <span className="post-card__price">Q{price}</span>
        </div>

        <p className="post-card__description">{description}</p>

        <footer className="post-card__footer">
          <button
            type="button"
            className="button button--small"
            onClick={handleDetailsClick}
          >
            {t("actions.details")} <ChevronRight size={14} />
          </button>

          <div className="post-card__footer-actions">
            {/* Like button */}
            {!soloLectura && publicacionId !== undefined && (
              <button
                type="button"
                className={`post-card__like-button${likeado ? " post-card__like-button--liked" : ""}`}
                onClick={toggleLike}
                disabled={likeLoading}
                aria-label={likeado ? "Quitar like" : "Dar like"}
                title={likeado ? "Quitar like" : "Dar like"}
              >
                <Heart size={18} fill={likeado ? "currentColor" : "none"} strokeWidth={2} />
                <span className="post-card__like-count">{count}</span>
              </button>
            )}

            {/* Save button */}
            {!soloLectura && publicacionId !== undefined && (
              <button
                type="button"
                className={`post-card__save-button${visuallySaved ? " post-card__save-button--saved" : ""}`}
                onClick={handleToggleSave}
                aria-label={guardada ? "Eliminar de guardados" : "Guardar publicación"}
                title={guardada ? "Eliminar de guardados" : "Guardar publicación"}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 size={22} className="post-card__upload-spinner" />
                ) : (
                  <Bookmark size={22} strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}
