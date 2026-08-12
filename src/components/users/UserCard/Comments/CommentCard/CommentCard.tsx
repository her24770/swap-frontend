"use client";

import { useState } from "react";
import { Flag, Star } from "lucide-react";
import ReporteModal from "../../../../ui/Modal/Reporte/ReporteModal";
import { useAuthStore } from "../../../../../store/authStore";
import "./CommentCard.css";

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
            <span className="comment-item__name">{authorName}</span>
            <span className="comment-item__time">{timeAgo}</span>
          </div>
        </div>
        <div className="comment-item__stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`comment-item__star${i < rating ? " comment-item__star--filled" : ""}`}
            >
              <Star size={16} fill={i < rating ? "currentColor" : "none"} />
            </span>
          ))}
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
