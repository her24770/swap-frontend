import React from "react";

interface CarouselIndicatorProps {
  totalItems: number;
  activeItemIndex: number;
  onDotClick: (index: number) => void;
}

export default function CarouselIndicator({
  totalItems,
  activeItemIndex,
  onDotClick,
}: CarouselIndicatorProps) {
  if (totalItems <= 1) return null;

  return (
    <div className="h-carousel__dots">
      {Array.from({ length: totalItems }).map((_, index) => (
        <button
          key={index}
          className={`h-carousel__dot ${
            index === activeItemIndex ? "h-carousel__dot--active" : ""
          }`}
          onClick={() => onDotClick(index)}
          type="button"
          aria-label={`Ir a elemento ${index + 1}`}
        />
      ))}
    </div>
  );
}
