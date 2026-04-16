import './PostImage.css';

interface PostImageProps {
  images: string[];
  alt: string;
  compact?: boolean;
}

export default function PostImage({ images, alt, compact = false }: PostImageProps) {
  const mainImage = images.length > 0 ? images[0] : '/placeholder.jpg';

  return (
    <div className={`product-image${compact ? " product-image--compact" : ""}`}>
      <img
        src={mainImage}
        alt={alt}
        className="product-image__content"
        loading="lazy"
      />
      {images.length > 1 && (
        <span className="product-image__badge">
          +{images.length - 1} fotos
        </span>
      )}
    </div>
  );
}