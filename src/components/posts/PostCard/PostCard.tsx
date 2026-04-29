"use client";

import { useRef, useState } from "react";
import { Camera, ChevronRight, Loader2, Edit2 } from "lucide-react";
import TagBadge from "../../ui/TagBadge/TagBadge";
import PostImage from "./PostImage/PostImage";
import EstadoTag from "./EstadoTag/EstadoTag";
import { imagenService } from "../../../services/imagenService";
import "../../ui/Button/Button.css";
import "./PostCard.css";
import type { Tag } from "../../../types/tag";

interface PostCardProps {
  title: string;
  price: number;
  description: string;
  images: string[];
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
  publicacionId?: number;
  estado?: string | number;
  canEdit?: boolean;
  onEditClick?: () => void;
  onEstadoChange?: (nuevoEstado: string) => void;
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
  canEdit = false,
  onEditClick,
  onEstadoChange,
}: PostCardProps) {
  const [displayImages, setDisplayImages] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetailsClick = () => {
    console.log(`Ver detalles de: ${title}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || publicacionId === undefined) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar los 5 MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await imagenService.uploadFotoPublicacion(publicacionId, file);
      setDisplayImages([url, ...displayImages.slice(1)]);
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <article className="post-card">
      <header className="post-card__header">
        {tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} size="sm" onClick={onTagClick} />
        ))}
      </header>

      <div className="post-card__media">
        <div className="post-card__image-wrapper">
          <PostImage images={displayImages} alt={title} />
          {estado !== undefined && (
            <div className="post-card__estado-tag-container">
              <EstadoTag
                estado={estado}
                canEdit={canEdit}
                onEstadoChange={onEstadoChange}
              />
            </div>
          )}
          {publicacionId !== undefined && (
            <>
              <div
                className="post-card__upload-overlay"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                aria-label="Subir imagen"
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
            Detalles <ChevronRight size={14} />
          </button>
          {canEdit && onEditClick && (
            <button
              type="button"
              className="button button--small"
              onClick={onEditClick}
            >
              <Edit2 size={14} /> Editar
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
