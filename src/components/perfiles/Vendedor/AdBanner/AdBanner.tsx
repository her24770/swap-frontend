import Image from "next/image";
import "./AdBanner.css";

export interface AdBannerData {
  imageUrl?: string;
  title?: string;
  description?: string;
}

interface AdBannerProps extends AdBannerData {}

export default function AdBanner({ imageUrl, title, description }: AdBannerProps) {
  if (!imageUrl && !title) {
    return (
      <div className="ad-banner">
        <div className="ad-banner__empty">
          <span className="ad-banner__empty-icon">📢</span>
          <p className="ad-banner__empty-text">Sin anuncio activo</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-banner${imageUrl ? " ad-banner--image" : ""}`}>
      {imageUrl && (
        <Image src={imageUrl} alt="Anuncio del vendedor" fill className="ad-banner__img" style={{ objectFit: 'cover' }} unoptimized />
      )}
      <div className="ad-banner__overlay">
        <span className="ad-banner__badge">Anuncio</span>
        {title && <h3 className="ad-banner__title">{title}</h3>}
        {description && <p className="ad-banner__description">{description}</p>}
      </div>
    </div>
  );
}