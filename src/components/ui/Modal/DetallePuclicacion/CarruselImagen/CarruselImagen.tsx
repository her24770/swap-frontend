"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { normalizeImageUrl } from "../../../../../lib/imageUrl";
import "./CarruselImagen.css";

type Props = {
  images: string[];
  altText: string;
};

export default function CarruselImagen({ images, altText }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const normalizedImages = useMemo(
    () => images.map(normalizeImageUrl).filter(Boolean),
    [images],
  );

  const visibleImages = useMemo(
    () => normalizedImages.filter((url) => !brokenUrls.has(url)),
    [normalizedImages, brokenUrls],
  );

  useEffect(() => {
    setCurrentIndex(0);
    setBrokenUrls(new Set());
  }, [images]);

  if (!visibleImages.length) {
    return (
      <div className="image-carousel image-carousel--empty" role="img" aria-label={altText}>
        <ImageOff size={40} strokeWidth={1.25} aria-hidden />
        <span>Sin imágenes</span>
      </div>
    );
  }

  const hasMultiple = visibleImages.length > 1;
  const safeIndex = Math.min(currentIndex, visibleImages.length - 1);
  const currentSrc = visibleImages[safeIndex];

  const goTo = (index: number) => setCurrentIndex(index);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? visibleImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === visibleImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = () => {
    setBrokenUrls((prev) => new Set(prev).add(currentSrc));
  };

  return (
    <div className="image-carousel">
      <div className="image-carousel__viewport">
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${altText} - ${safeIndex + 1} de ${visibleImages.length}`}
          className="image-carousel__img"
          onError={handleImageError}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className="image-carousel__btn image-carousel__btn--prev"
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="image-carousel__btn image-carousel__btn--next"
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>
            <div className="image-carousel__dots" role="tablist" aria-label="Imágenes de la publicación">
              {visibleImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === safeIndex}
                  aria-label={`Imagen ${index + 1}`}
                  className={`image-carousel__dot${index === safeIndex ? " image-carousel__dot--active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
