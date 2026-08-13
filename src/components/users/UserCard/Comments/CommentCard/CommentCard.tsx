"use client";

import { useState } from "react";
import ReporteModal from "../../../../ui/Modal/Reporte/ReporteModal";
import { useAuthStore } from "../../../../../store/authStore";
import { SquarePen, Star, Trash2, Flag } from "lucide-react";
import "./CommentCard.css";
import { useTranslations } from "next-intl";
import { useResena } from "../../../../../hooks/useResena";
import EditCommentModal, {
  type EditCommentData,
  type ResenaAction,
} from "../../../../ui/Modal/EditCommentModal/EditCommentModal";

interface CommentCardProps {
  idResena: number;
  commentId: number;
  authorId?: number;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
  canManage: boolean;
  onSuccess?: () => void | Promise<void>;
}


export default function CommentCard({ commentId, authorId, idResena, authorName, timeAgo, rating, comment, canManage, onSuccess }: CommentCardProps) {
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const esComentarioPropio = Boolean(idUsuarioActual != null && authorId != null && idUsuarioActual === authorId);
  const { editarResenaExistente, eliminarResena, loading, error, setError } = useResena();
  const t = useTranslations('comments.actions');
  const [modalAction, setModalAction] = useState<ResenaAction | null>(null);

  const openModal = (action: ResenaAction) => {
    setError(null);
    setModalAction(action);
  };

  const closeModal = () => {
    if (loading) return;
    setError(null);
    setModalAction(null);
  };

  const handleAction = async (data?: EditCommentData) => {
    const succeeded = modalAction === "edit"
      ? data && await editarResenaExistente(idResena, data)
      : await eliminarResena(idResena);

    if (!succeeded) return;
    setModalAction(null);
    await onSuccess?.();
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

        {canManage && (
          <div className="comment-item__actions">
            <button
              type="button"
              className="post-card__edit-button"
              onClick={() => openModal("edit")}
              disabled={loading}
              aria-label={t("edit")}
              title={t("edit")}
            >
              <SquarePen size={24} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="post-card__delete-button"
              onClick={() => openModal("delete")}
              disabled={loading}
              aria-label={t("delete")}
              title={t("delete")}
            >
              <Trash2 size={24} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
      <p className="comment-item__text">"{comment}"</p>
      {error && <p className="comment-item__error" role="alert">{error}</p>}
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
      <EditCommentModal
        isOpen={modalAction !== null}
        action={modalAction ?? "edit"}
        comment={comment}
        initialRating={rating}
        loading={loading}
        error={error}
        onAction={handleAction}
        onClose={closeModal}
      />
    </article>
  );
}

