"use client";

import React, { useEffect, useRef, useState } from "react";
import CarouselButton from "./CarouselButton";
import CarouselIndicator from "./CarouselIndicator";
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

  const totalItems = React.Children.count(children);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;

    const sLeft = track.scrollLeft;
    const sWidth = track.scrollWidth;
    const cWidth = track.clientWidth;

    const tolerance = 8; // Margen de píxeles para manejar redondeos de decimales
    setIsAtStart(sLeft <= tolerance);
    setIsAtEnd(sLeft + cWidth >= sWidth - tolerance);

    const firstChild = track.firstElementChild;
    let step = 240;
    if (firstChild) {
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 0;
      step = firstChild.getBoundingClientRect().width + gap;
    }

    const currentIndex = Math.min(
      totalItems - 1,
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
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 0;
      step = firstChild.getBoundingClientRect().width + gap;
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
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 0;
      step = firstChild.getBoundingClientRect().width + gap;
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
        totalItems={totalItems}
        activeItemIndex={activeItemIndex}
        onDotClick={handleDotClick}
      />
    </div>
  );
}



