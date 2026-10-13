"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CircleAlert, X } from "lucide-react";
import "./InfoHint.css";

export interface InfoHintItem {
  icon: ReactNode;
  label: string;
}

interface InfoHintProps {
  items: InfoHintItem[];
  ariaLabel?: string;
}

/**
 * Icono de ayuda que al tocarlo despliega un panel explicando qué hace
 * cada icono de la sección.
 */
export function InfoHint({ items, ariaLabel = "Ayuda sobre los íconos" }: InfoHintProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="swap-info-hint" ref={wrapperRef}>
      <button
        type="button"
        className="swap-info-hint__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <CircleAlert size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="swap-info-hint__panel" role="dialog" aria-label={ariaLabel}>
          <button
            type="button"
            className="swap-info-hint__close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
          <ul className="swap-info-hint__list">
            {items.map((item, i) => (
              <li key={i} className="swap-info-hint__item">
                <span className="swap-info-hint__item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
