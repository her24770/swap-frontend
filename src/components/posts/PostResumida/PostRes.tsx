"use client";

import { useRef, useState } from "react";
import { Camera, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { imagenService } from "../../../services/imagenService";
import { useUIStore } from "../../../store/uiStore";
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
  const t = useTranslations("posts");
  const { mostrarConfirm, agregarNotificacion } = useUIStore();

  const [displayImages, setDisplayImages] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetailsClick = () => {
    console.log(`Ver detalles de: ${title}`);
  };

  const uploadImage = async (file: File) => {
    if (publicacionId === undefined) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const { urlsNuevas } = await imagenService.actualizarPublicacion(publicacionId, { imagenes: [file] });
      if (urlsNuevas[0]) setDisplayImages((prev) => [...prev, urlsNuevas[0]]);
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
                aria-label={t("aria.uploadImage")}
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
            {t("actions.details")} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
