"use client";

import React, { useEffect, useRef, useState } from "react";
import CarouselButton from "../CarouselButton/CarouselButton";
import CarouselIndicator from "../CarouselIndicator/CarouselIndicator";
import "./AnunciosCarousel.css";

interface AnunciosCarouselProps {
  children: React.ReactNode;
}

export default function AnunciosCarousel({ children }: AnunciosCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [dotsCount, setDotsCount] = useState(0);

  // Si no hay elementos, no renderizamos nada
  if (items.length === 0) return null;

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;

    const sLeft = track.scrollLeft;
    const sWidth = track.scrollWidth;
    const cWidth = track.clientWidth;

    const tolerance = 8;
    setIsAtStart(sLeft <= tolerance);
    setIsAtEnd(sLeft + cWidth >= sWidth - tolerance);

    // En el carrusel de anuncios, cada anuncio ocupa el 100% del contenedor por lo que hay un punto por anuncio
    const calculatedDotsCount = items.length;
    setDotsCount(calculatedDotsCount);

    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const step = (cWidth || 1) + gap;

    const currentIndex = Math.min(
      calculatedDotsCount - 1,
      Math.max(0, Math.round(sLeft / step))
    );
    setActiveItemIndex(currentIndex);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleUpdate = () => {
      requestAnimationFrame(updateScrollState);
    };

    handleUpdate();

    track.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    const observer = new MutationObserver(handleUpdate);
    observer.observe(track, { childList: true, subtree: true });

    return () => {
      track.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      observer.disconnect();
    };
  }, [children]);

  const getStep = (track: HTMLDivElement) => {
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return track.clientWidth + gap;
  };

  const scroll = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const step = getStep(track);
    const scrollAmount = dir === "right" ? step : -step;
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleDotClick = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const step = getStep(track);
    track.scrollTo({
      left: index * step,
      behavior: "smooth",
    });
  };

  return (
    <div className="a-carousel">
      <CarouselButton
        direction="left"
        onClick={() => scroll("left")}
        disabled={isAtStart}
        ariaLabel="Anuncio anterior"
      />

      <div className="a-carousel__track" ref={trackRef}>
        {items.map((item, index) => (
          <div className="a-carousel__item" key={index}>
            {item}
          </div>
        ))}
      </div>

      <CarouselButton
        direction="right"
        onClick={() => scroll("right")}
        disabled={isAtEnd}
        ariaLabel="Siguiente anuncio"
      />

      <CarouselIndicator
        dotsCount={dotsCount}
        activeItemIndex={activeItemIndex}
        onDotClick={handleDotClick}
      />
    </div>
  );
}