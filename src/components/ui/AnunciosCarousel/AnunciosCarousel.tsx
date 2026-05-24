"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./AnunciosCarousel.css";

interface AnunciosCarouselProps {
  children: React.ReactNode;
  pageSize?: number;
  previousLabel?: string;
  moreLabel?: string;
}

export default function AnunciosCarousel({
  children,
  pageSize = 5,
  previousLabel = "Anterior",
  moreLabel = "Ver más",
}: AnunciosCarouselProps) {
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
    <div className="a-carousel">
      {hasPagination && (
        <div className="a-carousel__topbar">
          <span className="a-carousel__page">
            {currentPage + 1}/{pageCount}
          </span>
          {canGoBack && (
            <button
              className="a-carousel__page-btn"
              onClick={goToPreviousPage}
              type="button"
            >
              <ChevronLeft size={16} aria-hidden />
              {previousLabel}
            </button>
          )}
          {canGoForward && (
            <button
              className="a-carousel__page-btn"
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
        className="a-carousel__btn a-carousel__btn--prev"
        onClick={() => scroll("left")}
        type="button"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="a-carousel__track" ref={trackRef}>
        {visibleItems}
      </div>
      <button
        className="a-carousel__btn a-carousel__btn--next"
        onClick={() => scroll("right")}
        type="button"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
