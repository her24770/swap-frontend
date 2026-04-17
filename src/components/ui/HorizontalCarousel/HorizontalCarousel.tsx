"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HorizontalCarousel.css";

interface HorizontalCarouselProps {
  children: React.ReactNode;
}

export default function HorizontalCarousel({ children }: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = 240;
    trackRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="h-carousel">
      <button
        className="h-carousel__btn h-carousel__btn--prev"
        onClick={() => scroll("left")}
        type="button"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="h-carousel__track" ref={trackRef}>
        {children}
      </div>
      <button
        className="h-carousel__btn h-carousel__btn--next"
        onClick={() => scroll("right")}
        type="button"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}