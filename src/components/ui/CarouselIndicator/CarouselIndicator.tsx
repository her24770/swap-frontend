import React from "react";
import "./CarouselIndicator.css";

interface CarouselIndicatorProps {
  dotsCount: number;
  activeItemIndex: number;
  onDotClick: (index: number) => void;
}

export default function CarouselIndicator({
  dotsCount,
  activeItemIndex,
  onDotClick,
}: CarouselIndicatorProps) {
  if (dotsCount <= 1) return null;

  return (
    <div className="h-carousel__dots">
      {Array.from({ length: dotsCount }).map((_, index) => (
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
