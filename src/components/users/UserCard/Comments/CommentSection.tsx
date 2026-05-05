"use client";

import { useTranslations } from 'next-intl';
import CommentCard from "./CommentCard/CommentCard";
import CommentForm from "./CommentForm/CommentForm";
import type { Comment } from "../../../../types/comment";
import "./CommentSection.css";

interface CommentSectionProps {
  targetName: string;
  comments: Comment[];
  onSubmit: (comment: string, rating: number, anonymous: boolean) => void;
  onCancel: () => void;
}

export default function CommentSection({ targetName, comments, onSubmit, onCancel }: CommentSectionProps) {
  const t = useTranslations('comments');

  return (
    <div className="comment-section">
      {/* Formulario izquierda */}
      <div className="comment-section__form-col">
        <CommentForm
          targetName={targetName}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>

      {/* Lista derecha con scroll */}
      <div className="comment-section__list-col">
        <div className="comment-section__list">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              authorName={c.authorName}
              timeAgo={c.timeAgo}
              rating={c.rating}
              comment={c.comment}
            />
          ))}
          {comments.length === 0 && (
            <p className="comment-section__empty">{t('empty')}</p>
          )}
        </div>
      </div>
    </div>
  );
}