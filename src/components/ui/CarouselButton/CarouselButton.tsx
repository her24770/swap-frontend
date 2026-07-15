import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CarouselButton.css";

interface CarouselButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  ariaLabel?: string;
}

export default function CarouselButton({
  direction,
  onClick,
  disabled,
  ariaLabel,
}: CarouselButtonProps) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  const defaultAriaLabel = direction === "left" ? "Anterior" : "Siguiente";

  return (
    <button
      className={`h-carousel__btn h-carousel__btn--${direction}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={ariaLabel || defaultAriaLabel}
    >
      <Icon size={18} strokeWidth={2.5} />
    </button>
  );
}
