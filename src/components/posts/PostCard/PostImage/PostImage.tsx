"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import "./PostImage.css";

interface PostImageProps {
  images: string[];
  alt: string;
  compact?: boolean;
}

export default function PostImage({ images, alt, compact = false }: PostImageProps) {
  const [imgError, setImgError] = useState(false);
  const mainImage = !imgError && images.length > 0 ? images[0] : null;

  return (
    <div className={`product-image${compact ? " product-image--compact" : ""}`}>
      {mainImage ? (
        <img
          src={mainImage}
          alt={alt}
          className="product-image__content"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="product-image__fallback">
          <ImageOff size={28} />
        </div>
      )}
      {images.length > 1 && !imgError && (
        <span className="product-image__badge">
          +{images.length - 1} fotos
        </span>
      )}
    </div>
  );
}
