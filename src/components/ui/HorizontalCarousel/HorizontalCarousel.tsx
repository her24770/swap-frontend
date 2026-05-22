"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HorizontalCarousel.css";

interface HorizontalCarouselProps {
  children: React.ReactNode;
  pageSize?: number;
  previousLabel?: string;
  moreLabel?: string;
}

export default function HorizontalCarousel({
  children,
  pageSize = 5,
  previousLabel = "Anterior",
  moreLabel = "Ver más",
}: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const items = useMemo(() => React.Children.toArray(children), [children]);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleItems = items.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const hasPagination = items.length > pageSize;
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < pageCount - 1;

  useEffect(() => {
    setPage(0);
  }, [items.length, pageSize]);

  const scrollTrackToStart = () => {
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    });
  };

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
    scrollTrackToStart();
  };

  const goToNextPage = () => {
    setPage((prev) => Math.min(prev + 1, pageCount - 1));
    scrollTrackToStart();
  };

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = 240;
    trackRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="h-carousel">
      {hasPagination && (
        <div className="h-carousel__topbar">
          <span className="h-carousel__page">
            {currentPage + 1}/{pageCount}
          </span>
          {canGoBack && (
            <button
              className="h-carousel__page-btn"
              onClick={goToPreviousPage}
              type="button"
            >
              <ChevronLeft size={16} aria-hidden />
              {previousLabel}
            </button>
          )}
          {canGoForward && (
            <button
              className="h-carousel__page-btn"
              onClick={goToNextPage}
              type="button"
            >
              {moreLabel}
              <ChevronRight size={16} aria-hidden />
            </button>
          )}
        </div>
      )}
      <button
        className="h-carousel__btn h-carousel__btn--prev"
        onClick={() => scroll("left")}
        type="button"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="h-carousel__track" ref={trackRef}>
        {visibleItems}
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
