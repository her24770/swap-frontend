import { SquarePen, Star, Trash2 } from "lucide-react";
import "./CommentCard.css";
import { useTranslations } from "next-intl";
import { useResena } from "../../../../../hooks/useResena";

interface CommentCardProps {
  idResena: number;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
  canManage: boolean;
  onSuccess?: () => void | Promise<void>;
}

export default function CommentCard({
  idResena,
  authorName,
  timeAgo,
  rating,
  comment,
  canManage,
  onSuccess,
}: CommentCardProps) {
  const { editarResenaExistente, eliminarResena, loading, error } = useResena();
  const t = useTranslations('comments.actions');

  const onEditClick = async () => {
    const contenido = window.prompt(t("editPrompt"), comment)?.trim();
    if (!contenido || contenido === comment) return;

    if (await editarResenaExistente(idResena, { contenido })) await onSuccess?.();
  };

  const onDeleteClick = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;

    if (await eliminarResena(idResena)) await onSuccess?.();
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
              onClick={onEditClick}
              disabled={loading}
              aria-label={t("edit")}
              title={t("edit")}
            >
              <SquarePen size={24} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="post-card__delete-button"
              onClick={onDeleteClick}
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
    </article>
  );
}
