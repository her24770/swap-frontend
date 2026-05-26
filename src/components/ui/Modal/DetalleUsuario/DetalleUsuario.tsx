"use client";

import Image from "next/image";
import { X, ChevronRight, UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import TagBadge from "../../../ui/TagBadge/TagBadge";
import type { Tag } from "../../../../types/tag";
import "../../../ui/Button/Button.css";
import "../Modal.css";
import "../DetallePuclicacion/DetallePublicacion.css";
import "./DetalleUsuario.css";

interface DetalleUsuarioProps {
  isOpen?: boolean;
  onClose: () => void;

  userId?: number;
  userName: string;
  userRating: number;
  userImageUrl?: string;

  temas?: string[];

  tags?: Tag[];

  onVerCertificados?: () => void;
  onVerPerfil?: (userId: number) => void;
}

const MAX_STARS = 5;

export default function DetalleUsuario({
  isOpen = true,
  onClose,
  userId,
  userName,
  userRating,
  userImageUrl,
  temas = [],
  tags = [],
  onVerCertificados,
  onVerPerfil,
}: DetalleUsuarioProps) {
  const t = useTranslations("posts");

  if (!isOpen) return null;

  const canOpenProfile = Boolean(onVerPerfil && userId !== undefined);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal detalle-usuario" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="post-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="post-modal__top">
          <button
            type="button"
            className={`post-modal__seller${canOpenProfile ? " post-modal__seller--clickable" : ""}`}
            onClick={() => {
              if (userId !== undefined) onVerPerfil?.(userId);
            }}
            disabled={!canOpenProfile}
            aria-label={`Ver perfil de ${userName}`}
          >
            <div className="post-modal__seller-avatar">
              {userImageUrl ? (
                <Image
                  src={userImageUrl}
                  alt={userName}
                  fill
                  className="post-modal__seller-img"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <UserCircle2
                  size={40}
                  strokeWidth={1}
                  className="post-modal__seller-placeholder"
                />
              )}
            </div>
            <div className="post-modal__seller-info">
              <span className="post-modal__seller-name">{userName}</span>
              <div className="post-modal__stars">
                {Array.from({ length: MAX_STARS }).map((_, i) => (
                  <span
                    key={i}
                    className={`post-modal__star${i < userRating ? " post-modal__star--filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>

        {tags.length > 0 && (
          <div className="post-modal__tags">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {temas.length > 0 && (
          <div className="detalle-usuario__temas">
            <p className="detalle-usuario__temas-label">{t("tutorTopicsLabel")}</p>
            <ul className="detalle-usuario__temas-list">
              {temas.map((tema, i) => (
                <li key={i} className="detalle-usuario__tema-item">
                  — {tema}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="post-modal__actions">
          {onVerCertificados && (
            <button
              type="button"
              className="button button--medium button--warning button--full-width"
              onClick={onVerCertificados}
            >
              {t("actions.certificado")}
            </button>
          )}

          {canOpenProfile && (
            <button
              type="button"
              className="button button--medium button--full-width"
              onClick={() => onVerPerfil!(userId!)}
            >
              {t("actions.viewProfile")} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
