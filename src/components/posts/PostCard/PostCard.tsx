"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, ChevronRight, Loader2, SquarePen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import TagBadge from "../../ui/TagBadge/TagBadge";
import PostImage from "./PostImage/PostImage";
import EstadoTag from "./EstadoTag/EstadoTag";
import { imagenService } from "../../../services/imagenService";
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
  canEdit?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onImageUpdate?: (newUrl: string) => void;
  onEstadoChange?: (nuevoEstado: string) => void;
  onDetallesClick?: () => void;
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
  canEdit = false,
  onEditClick,
  onDeleteClick,
  onImageUpdate,
  onEstadoChange,
  onDetallesClick,
}: PostCardProps) {
  const t = useTranslations("posts");

  const [displayImages, setDisplayImages] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayImages(images);
  }, [images]);

  const handleDetailsClick = () => {
    if (onDetallesClick) {
      onDetallesClick();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || publicacionId === undefined) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError(t("uploadErrors.invalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("uploadErrors.tooLarge"));
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await imagenService.uploadFotoPublicacion(publicacionId, file);
      const urlConBuster = `${url}?t=${Date.now()}`;
      setDisplayImages([urlConBuster, ...displayImages.slice(1)]);
      onImageUpdate?.(urlConBuster);
    } catch (err: any) {
      setUploadError(err.message || t("uploadErrors.generic"));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <article className="post-card">
      <header className="post-card__header">
        {estado !== undefined && (
          <div className="post-card__estado-tag-container">
            <EstadoTag
              estado={estado}
              canEdit={canEdit}
              estadosDisponibles={estadosDisponibles}
              onEstadoChange={onEstadoChange}
            />
          </div>
        )}

        {canEdit && onEditClick && (
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
        {canEdit && onDeleteClick && (
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
      </header>

      <div className="post-card__media">
        <div className="post-card__image-wrapper">
          <PostImage images={displayImages} alt={title} />
          {publicacionId !== undefined && (
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
        </footer>
      </div>
    </article>
  );
}
