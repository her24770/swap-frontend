import { SquarePlus } from "lucide-react";
import "./FloatingButton.css";

type Props = {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
};

export function FloatingButton({ onClick, ariaLabel = "Agregar", className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`fab ${className}`}
    >
      <SquarePlus className="fab__icon" aria-hidden />
    </button>
  );
}