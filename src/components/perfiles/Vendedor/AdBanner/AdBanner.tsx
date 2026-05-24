import Image from "next/image";
import { usePerspectivaInterna } from "../../../../context/PerspectivaInternaContext";
import "./AdBanner.css";
import { useTranslations } from "next-intl";
import { SquarePen, Trash2 } from "lucide-react";

export interface AdBannerData {
  imageUrl?: string;
  title?: string;
  description?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

interface AdBannerProps extends AdBannerData {}

export default function AdBanner({ imageUrl, title, description, onEditClick, onDeleteClick }: AdBannerProps) {
  const t = useTranslations("posts");
  const { canEditCards } = usePerspectivaInterna();

  // Validación defensiva por si llega un string vacío "" desde el backend
  const tieneImagen = imageUrl && imageUrl.trim() !== "";

  return (
    <div className={`ad-banner${tieneImagen ? " ad-banner--image" : ""}`}>
      {tieneImagen && (
        <Image 
          src={imageUrl} 
          alt={title || "Anuncio del vendedor"} 
          fill 
          className="ad-banner__img" 
          style={{ objectFit: 'cover' }} 
          unoptimized 
        />
      )}
      <div className="ad-banner__overlay">
        <div className="ad-banner__header-actions">
          {canEditCards && onEditClick && (
            <button
              type="button"
              className="ad-card__edit-button"
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
              className="ad-card__delete-button"
              onClick={onDeleteClick}
              aria-label="Eliminar publicación"
              title="Eliminar publicación"
            >
              <Trash2 size={24} strokeWidth={2} />
            </button>
          )}
        </div>
        <span className="ad-banner__badge">Anuncio</span>
        {title && <h3 className="ad-banner__title">{title}</h3>}
        {description && <p className="ad-banner__description">{description}</p>}
      </div>
    </div>
  );
}