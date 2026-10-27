"use client";

import Image from "next/image";
import { UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import EstadoTag from "../../../posts/PostCard/EstadoTag/EstadoTag";
import type { EstadoOpcion } from "../../../../hooks/useEstados";

const MAX_STARS = 5;

interface VendedorHeaderProps {
  sellerName: string;
  sellerRating: number;
  sellerId?: number;
  sellerImageUrl?: string;
  onSellerClick?: (sellerId: number) => void;
  estado?: string | number;
  estadosDisponibles: EstadoOpcion[];
  onEstadoChange?: (nuevoEstado: string) => void;
}

// Datos del vendedor (avatar, nombre y calificación) y estado de la publicación.
export default function VendedorHeader({
  sellerName,
  sellerRating,
  sellerId,
  sellerImageUrl,
  onSellerClick,
  estado,
  estadosDisponibles,
  onEstadoChange,
}: VendedorHeaderProps) {
  const t = useTranslations("posts");

  return (
    <div className="post-modal__top">
      <button
        type="button"
        className={`post-modal__seller${onSellerClick && sellerId ? " post-modal__seller--clickable" : ""}`}
        onClick={() => { if (sellerId) onSellerClick?.(sellerId); }}
        disabled={!onSellerClick || !sellerId}
        aria-label={`${sellerName}: ${t("actions.viewProfile")}`}
      >
        <div className="post-modal__seller-avatar">
          {sellerImageUrl ? (
            <Image
              src={sellerImageUrl}
              alt={sellerName}
              fill
              className="post-modal__seller-img img-cover"
              unoptimized
            />
          ) : (
            <UserCircle2 size={40} strokeWidth={1} className="post-modal__seller-placeholder" />
          )}
        </div>
        <div className="post-modal__seller-info">
          <span className="post-modal__seller-name">{sellerName}</span>
          <div className="post-modal__stars">
            {Array.from({ length: MAX_STARS }).map((_, i) => (
              <span
                key={i}
                className={`post-modal__star${i < sellerRating ? " post-modal__star--filled" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </button>

      {estado !== undefined && (
        <div className="post-modal__estado">
          <EstadoTag
            estado={estado}
            estadosDisponibles={estadosDisponibles}
            onEstadoChange={onEstadoChange}
          />
        </div>
      )}
    </div>
  );
}
