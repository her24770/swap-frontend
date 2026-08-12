"use client";

import { useState } from "react";
import ReporteModal from "../../../../ui/Modal/Reporte/ReporteModal";
import { useAuthStore } from "../../../../../store/authStore";
import { SquarePen, Star, Trash2, Flag } from "lucide-react";
import "./CommentCard.css";
import { useFormatter, useTranslations } from "next-intl";
import { useResena } from "../../../../../hooks/useResena";

interface CommentCardProps {
  commentId: number;
  authorId?: number;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export default function CommentCard({ commentId, authorId, authorName, timeAgo, rating, comment }: CommentCardProps) {
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const esComentarioPropio = Boolean(idUsuarioActual != null && authorId != null && idUsuarioActual === authorId);
  const { editarResenaExistente, eliminarResena, loading, error } = useResena();
  const t = useTranslations('posts');

  const onEditClick = () => {
    console.log("Editar reseña");
  };

  const onDeleteClick = () => {
    console.log("Eliminar reseña");
  };

  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article className="comment-item">
      <div className="comment-item__header">
        <div className="comment-item__author">
          <div className="comment-item__avatar">{initials}</div>
          <div className="comment-item__author-info">
            <div className="comment-item__author-name-stars">
              <span className="comment-item__name">{authorName}</span>
              <span className="comment-item__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`comment-item__star${i < rating ? " comment-item__star--filled" : ""}`}
                  >
                    <Star size={16} fill={i < rating ? "currentColor" : "none"} />
                  </span>
                ))}
              </span>
            </div>

            <span className="comment-item__time">{timeAgo}</span>
          </div>
        </div>

        {/* Acciones de edición y eliminación */}
        <div className="comment-item__actions">
          <button
            type="button"
            className="post-card__edit-button"
            onClick={onEditClick}
            aria-label={t("actions.edit")}
            title={t("actions.edit")}
          >
            <SquarePen size={24} strokeWidth={2} />
          </button>

          <button
            type="button"
            className="post-card__delete-button"
            onClick={onDeleteClick}
            aria-label={t("actions.delete")}
            title={t("actions.delete")}
          >
            <Trash2 size={24} strokeWidth={2} />
          </button>
        </div>
      </div>
      <p className="comment-item__text">"{comment}"</p>
      {!esComentarioPropio && (
        <>
          <button
            type="button"
            className="comment-item__report"
            onClick={() => setReporteAbierto(true)}
            aria-label="Reportar comentario"
          >
            <Flag size={14} />
            Reportar
          </button>
          <ReporteModal
            isOpen={reporteAbierto}
            tipoObjetivo="comentario"
            idObjetivo={commentId}
            onClose={() => setReporteAbierto(false)}
          />
        </>
      )}
    </article>
  );
}
