import "./AdBanner.css";

export interface AdBannerData {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

interface AdBannerProps extends AdBannerData {}

export default function AdBanner({ imageUrl, title, subtitle }: AdBannerProps) {
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
        <img src={imageUrl} alt="Anuncio del vendedor" className="ad-banner__img" />
      )}
      <div className="ad-banner__overlay">
        <span className="ad-banner__badge">Anuncio</span>
        {title && <h3 className="ad-banner__title">{title}</h3>}
        {subtitle && <p className="ad-banner__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}