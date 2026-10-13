"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import "./Tooltip.css";

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * En pantallas tactil el tooltip hover se muestra conel primer tap, este muestra el tooltip por 2s
 * sin disparar la acción del hijo, un segundo tap mientras está visible sí la ejecuta.
 * En desktop el hover/focus muestra el tooltip vía CSS
 */
export function Tooltip({ label, children, position = "top" }: TooltipProps) {
  const [tapVisible, setTapVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTouch = useRef(isCoarsePointer());

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hide = () => {
    clearTimeout(timerRef.current);
    setTapVisible(false);
  };

  const handleClickCapture = (e: MouseEvent) => {
    if (!isTouch.current) return;
    if (!tapVisible) {
      e.preventDefault();
      e.stopPropagation();
      setTapVisible(true);
      timerRef.current = setTimeout(hide, 2000);
      return;
    }
    hide();
  };

  return (
    <span className="swap-tooltip-wrapper" onClickCapture={handleClickCapture}>
      {children}
      <span
        className={`swap-tooltip-bubble swap-tooltip-bubble--${position}`}
        data-visible={tapVisible}
        aria-hidden="true"
      >
        {label}
      </span>
    </span>
  );
}
