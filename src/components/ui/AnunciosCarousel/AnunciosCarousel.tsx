"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./AnunciosCarousel.css";

interface AnunciosCarouselProps {
  children: React.ReactNode;
}

export default function AnunciosCarousel({ children }: AnunciosCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);

  // Si no hay elementos, no renderizamos nada
  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;

    // Detecta dinámicamente el ancho visible actual del contenedor
    const containerWidth = trackRef.current.clientWidth;
    
    // Desplaza aproximadamente el 80% del contenedor para un movimiento fluido
    const scrollAmount = dir === "right" ? containerWidth * 0.8 : -containerWidth * 0.8;

    trackRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="a-carousel">
      {/* Botón Izquierdo */}
      <button
        className="a-carousel__btn a-carousel__btn--prev"
        onClick={() => scroll("left")}
        type="button"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Track que contiene todos los elementos de forma nativa */}
      <div className="a-carousel__track" ref={trackRef}>
        {items.map((item, index) => (
          <div className="a-carousel__item" key={index}>
            {item}
          </div>
        ))}
      </div>

      {/* Botón Derecho */}
      <button
        className="a-carousel__btn a-carousel__btn--next"
        onClick={() => scroll("right")}
        type="button"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}