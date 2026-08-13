import { SquarePen, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import "./CommentCard.css";
import { useFormatter, useTranslations } from "next-intl";
import { useResena } from "../../../../../hooks/useResena";
import EditCommentModal, {
  type EditCommentData,
  type ResenaAction,
} from "../../../../ui/Modal/EditCommentModal/EditCommentModal";

interface CommentCardProps {
  idResena: number;
  authorName: string;
  timeAgo: Date | string;
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
  const { editarResenaExistente, eliminarResena, loading, error, setError } = useResena();
  const t = useTranslations('comments.actions');
  const [modalAction, setModalAction] = useState<ResenaAction | null>(null);
  const format = useFormatter(); 
  const formattedTimeAgo = format.relativeTime(new Date(timeAgo));



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

            <span className="comment-item__time">{formattedTimeAgo}</span>
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
