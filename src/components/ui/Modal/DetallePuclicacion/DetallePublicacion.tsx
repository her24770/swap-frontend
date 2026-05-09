"use client";

import Image from "next/image";
import { X, Bookmark, ChevronRight } from "lucide-react";
import { UserCircle2 } from "lucide-react";
import "../../Button/Button.css";
import "../Modal.css";
import "./DetallePublicacion.css";
import type { Tag } from "../../../../types/tag";

export type DetallePublicacionType = "venta" | "tutoria";

interface PostModalProps {
  isOpen?: boolean;
  onClose: () => void;
  type: DetallePublicacionType;

  // Publicacion
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  tags?: Tag[];
  likes?: number;

  // Vendedor
  sellerName: string;
  sellerRating: number;
  sellerImageUrl?: string;

  // Acciones
  onAcordarCompra?: () => void;
  onSolicitarTutoria?: () => void;
  onVerCertificados?: () => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
}

export default function DetallePublicacion({
  isOpen = true,
  onClose,
  type,
  title,
  price,
  description,
  imageUrl,
  tags = [],
  likes = 0,
  sellerName,
  sellerRating,
  sellerImageUrl,
  onAcordarCompra,
  onSolicitarTutoria,
  onVerCertificados,
  onToggleSave,
  isSaved = false,
}: PostModalProps) {
  if (!isOpen) return null;

  const MAX_STARS = 5;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>

        <button
          type="button"
          className="post-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Vendedor  */}
        <div className="post-modal__seller">
          <div className="post-modal__seller-avatar">
            {sellerImageUrl ? (
              <Image src={sellerImageUrl} alt={sellerName} fill className="post-modal__seller-img" style={{ objectFit: 'cover' }} unoptimized />
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
        </div>

        <div className="post-modal__body">

          <div className="post-modal__image-col">
            <div className="post-modal__image">
              <Image src={imageUrl} alt={title} fill style={{ objectFit: 'cover' }} unoptimized />
            </div>

            {tags.length > 0 && (
              <div className="post-modal__tags">
                {tags.map((tag) => (
                  <span key={tag.id} className="post-modal__tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="post-modal__info-col">
            <div className="post-modal__info-header">
              <h2 className="post-modal__title">{title}</h2>
              <span className="post-modal__price">Q{price}</span>
            </div>

            <p className="post-modal__description">{description}</p>

            {/* Si es tutoria o venta se tienen diferentes botones*/}
            <div className="post-modal__actions">
              {type === "venta" && (
                <button
                  type="button"
                  className="button button--medium"
                  onClick={onAcordarCompra}
                >
                  Acordar Compra <ChevronRight size={16} />
                </button>
              )}

              {type === "tutoria" && (
                <>
                  <button
                    type="button"
                    className="button button--medium button--warning"
                    onClick={onVerCertificados}
                  >
                    Certificados
                  </button>
                  <button
                    type="button"
                    className="button button--medium"
                    onClick={onSolicitarTutoria}
                  >
                    Solicitar Tutoría <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="post-modal__likes">
                <button
                    type="button"
                    className={`post-modal__save${isSaved ? " post-modal__save--saved" : ""}`}
                    onClick={onToggleSave}
                    aria-label="Guardar publicación"
                >
                    <Bookmark size={18} />
                </button>
                <span className="post-modal__likes-count">{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}