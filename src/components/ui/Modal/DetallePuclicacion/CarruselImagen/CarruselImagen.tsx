"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { normalizeImageUrl } from "../../../../../lib/imageUrl";
import Image from "next/image";
import "./CarruselImagen.css";

type Props = {
  images: string[];
  altText: string;
};

export default function CarruselImagen({ images, altText }: Props) {
  const t = useTranslations("posts.carousel");
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

  const imagesKey = images.join("|");
  const [prevImagesKey, setPrevImagesKey] = useState(imagesKey);
  if (prevImagesKey !== imagesKey) {
    setPrevImagesKey(imagesKey);
    setCurrentIndex(0);
    setBrokenUrls(new Set());
  }

  if (!visibleImages.length) {
    return (
      <div className="image-carousel image-carousel--empty" role="img" aria-label={altText}>
        <ImageOff size={40} strokeWidth={1.25} aria-hidden />
        <span>{t("noImages")}</span>
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
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={t("imageAlt", { alt: altText, current: safeIndex + 1, total: visibleImages.length })}
          width={800}
          height={600}
          className="image-carousel__img"
          onError={handleImageError}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className="image-carousel__btn image-carousel__btn--prev"
              onClick={handlePrev}
              aria-label={t("prevImageAria")}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="image-carousel__btn image-carousel__btn--next"
              onClick={handleNext}
              aria-label={t("nextImageAria")}
            >
              <ChevronRight size={20} />
            </button>
            <div className="image-carousel__dots" role="tablist" aria-label={t("imagesAria")}>
              {visibleImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === safeIndex}
                  aria-label={t("dotAria", { number: index + 1 })}
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
