"use client";

import { useTranslations } from 'next-intl';
import CommentCard from "./CommentCard/CommentCard";
import CommentForm from "./CommentForm/CommentForm";
import "./CommentSection.css";
import type { Resena} from "../../../../types/resena";
import { usePerspectivaInterna } from "../../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../../store/authStore";


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
  const { isOwnProfile } = usePerspectivaInterna();
  const currentUserId = useAuthStore((state) => state.usuario?.id_usuario);

  return (
    <>
      <h2 className="perfil-page__catalog-bar-title">{t("title")}</h2>
      <div className="comment-section">
        
        {!isOwnProfile && (
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
                commentId={c.id_resena}
                authorId={c.emisor.id_usuario}
                idResena={c.id_resena}
                authorName={c.emisor.nombre}
                timeAgo={c.fecha_resena}
                rating={c.calificacion}
                comment={c.contenido}
                canManage={currentUserId != null && c.id_emisor === currentUserId}
                onSuccess={onSuccessSubmit}
              />
            ))}
            {comments.length === 0 && (
              <p className="comment-section__empty">{t('empty')}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

