"use client";

import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import "../../../../ui/Button/Button.css";
import "./CommentForm.css";

interface CommentFormProps {
  targetName: string;
  onSubmit: (comment: string, rating: number, anonymous: boolean) => void;
  onCancel: () => void;
}

export default function CommentForm({ targetName, onSubmit, onCancel }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit(comment.trim(), rating, anonymous);
    setComment("");
    setRating(0);
    setAnonymous(false);
  };

  return (
    <div className="comment-form">
      {/* Estrellas de reseña */}
      <div className="comment-form__stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`comment-form__star${(hoverRating || rating) > i ? " comment-form__star--active" : ""}`}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i + 1)}
            aria-label={`${i + 1} estrellas`}
          >
            <Star size={24} fill={(hoverRating || rating) > i ? "currentColor" : "none"}/>
          </button>
        ))}
      </div>

      {/* Escribir comentario */}
      <textarea
        className="comment-form__textarea"
        placeholder={`Deja un comentario a ${targetName}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={5}
      />

      {/* Footer */}
      <div className="comment-form__footer">
        <label className="comment-form__anonymous">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="comment-form__checkbox"
          />
          Enviar como anónimo
        </label>
        <div className="comment-form__actions">
          <button
            type="button"
            className="button button--medium button--danger"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button button--medium"
            onClick={handleSubmit}
            disabled={!comment.trim()}
          >
            Enviar <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}