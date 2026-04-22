"use client";

import { useRef, useState } from "react";
import { Camera, ChevronRight, Loader2 } from "lucide-react";
import { imagenService } from "../../../services/imagenService";
import "../../ui/Button/Button.css";
import "./PostRes.css";
import PostImage from "../PostCard/PostImage/PostImage";

interface PostResProps {
  title: string;
  price: number;
  images: string[];
  publicacionId?: number;
}

export default function PostRes({ title, price, images, publicacionId }: PostResProps) {
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
      setUploadError("Solo se permiten JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Máximo 5 MB");
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
    <article className="post-res-card">
      <div className="post-res-card__media">
        <div className="post-res-card__image-wrapper">
          <PostImage images={displayImages} alt={title} compact />
          {publicacionId !== undefined && (
            <>
              <div
                className="post-res-card__upload-overlay"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                aria-label="Subir imagen"
              >
                {isUploading
                  ? <Loader2 size={20} className="post-res-card__upload-spinner" />
                  : <Camera size={20} />
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
      </div>

      <div className="post-res-card__content">
        <div className="post-res-card__info">
          <h3 className="post-res-card__title">{title}</h3>
          <span className="post-res-card__price">Q{price}</span>
        </div>

        {uploadError && (
          <p className="post-res-card__upload-error">{uploadError}</p>
        )}

        <div className="post-res-card__footer">
          <button
            type="button"
            className="button button--small"
            onClick={handleDetailsClick}
          >
            Detalles <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
