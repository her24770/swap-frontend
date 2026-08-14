"use client";

import { useTranslations } from 'next-intl';
import CommentCard from "./CommentCard/CommentCard";
import CommentForm from "./CommentForm/CommentForm";
import "./CommentSection.css";
import type { Resena} from "../../../../types/resena";


interface CommentSectionProps {
  targetName: string;
  idReceptor: number;
  comments: Resena[];
  onSuccessSubmit?: () => void;
  onCancel: () => void;
  soloLectura?: boolean;
}

export default function CommentSection({
  targetName,
  idReceptor,
  comments,
  onSuccessSubmit,
  onCancel,
  soloLectura = false,
}: CommentSectionProps) {
  const t = useTranslations('comments');

  return (
    <div className="comment-section">
      {/* Formulario izquierda */}
      {!soloLectura && (
        <div className="comment-section__form-col">
          <CommentForm
            targetName={targetName}
            idReceptor={idReceptor}
            onSuccess={onSuccessSubmit}
            onCancel={onCancel}
          />
        </div>
      )}

      <div className="comment-section__list-col">
        <div className="comment-section__list">
          {comments.map((c) => (
            <CommentCard
              key={c.id_resena}
              authorName={c.emisor.nombre}
              timeAgo={c.fecha_resena}
              rating={c.calificacion}
              comment={c.contenido}
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