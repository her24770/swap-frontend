"use client";

import React, { useEffect, useRef, useState } from "react";
import CarouselButton from "../CarouselButton/CarouselButton";
import CarouselIndicator from "../CarouselIndicator/CarouselIndicator";
import "./HorizontalCarousel.css";

interface HorizontalCarouselProps {
  children: React.ReactNode;
  pageSize?: number;
  showPagination?: boolean;
  previousLabel?: string;
  moreLabel?: string;
}

export default function HorizontalCarousel({
  children,
  previousLabel = "Anterior",
  moreLabel = "Ver más",
}: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [dotsCount, setDotsCount] = useState(0);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;

    const sLeft = track.scrollLeft;
    const sWidth = track.scrollWidth;
    const cWidth = track.clientWidth;

    const tolerance = 8;
    setIsAtStart(sLeft <= tolerance);
    setIsAtEnd(sLeft + cWidth >= sWidth - tolerance);

    const firstChild = track.firstElementChild;
    let step = 240;
    if (firstChild) {
      const rectWidth = firstChild.getBoundingClientRect().width;
      if (rectWidth > 0) {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.gap) || 0;
        step = rectWidth + gap;
      }
    }

    // Cantidad real de posiciones de desplazamiento posibles (movimientos)
    const maxActiveIndex = Math.max(0, Math.ceil((sWidth - cWidth) / step));
    const calculatedDotsCount = maxActiveIndex + 1;
    setDotsCount(calculatedDotsCount);

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

    // Actualización inicial
    handleUpdate();

    // Eventos de scroll y resize
    track.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    // MutationObserver para reaccionar ante la carga dinámica de nuevas cartas
    const observer = new MutationObserver(handleUpdate);
    observer.observe(track, { childList: true, subtree: true });

    return () => {
      track.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      observer.disconnect();
    };
  }, [children]);

  const scroll = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const firstChild = track.firstElementChild;
    let step = 240;
    if (firstChild) {
      const rectWidth = firstChild.getBoundingClientRect().width;
      if (rectWidth > 0) {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.gap) || 0;
        step = rectWidth + gap;
      }
    }

    const scrollAmount = dir === "right" ? step : -step;
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleDotClick = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const firstChild = track.firstElementChild;
    let step = 240;
    if (firstChild) {
      const rectWidth = firstChild.getBoundingClientRect().width;
      if (rectWidth > 0) {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.gap) || 0;
        step = rectWidth + gap;
      }
    }

    track.scrollTo({
      left: index * step,
      behavior: "smooth",
    });
  };

  return (
    <div className="h-carousel">
      <CarouselButton
        direction="left"
        onClick={() => scroll("left")}
        disabled={isAtStart}
        ariaLabel={previousLabel}
      />

      <div className="h-carousel__track" ref={trackRef}>
        {children}
      </div>

      <CarouselButton
        direction="right"
        onClick={() => scroll("right")}
        disabled={isAtEnd}
        ariaLabel={moreLabel}
      />

      <CarouselIndicator
        dotsCount={dotsCount}
        activeItemIndex={activeItemIndex}
        onDotClick={handleDotClick}
      />
    </div>
  );
}


