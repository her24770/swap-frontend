"use client";

import { useState } from "react";
import Image from "next/image";
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
        <Image
          src={mainImage}
          alt={alt}
          fill
          className="product-image__content"
          style={{ objectFit: 'cover' }}
          onError={() => setImgError(true)}
          unoptimized
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
