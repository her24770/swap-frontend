import { Skeleton } from '../../../ui/Skeleton/Skeleton';
import './PostCardSkeleton.css';

export function PostCardSkeleton() {
  return (
    <div className="pcs" aria-label="Cargando publicación..." aria-busy="true">

      {/* Header con las tags y los btn*/}
      <div className="pcs__header">
        <div className="pcs__tags">
          <Skeleton className="pcs__tag" />
          <Skeleton className="pcs__tag" />
        </div>
        <div className="pcs__actions">
          <Skeleton className="pcs__action-btn" />
          <Skeleton className="pcs__action-btn" />
        </div>
      </div>

      <div className="pcs__media">
        <Skeleton className="pcs__image" />
      </div>

      {/* Content */}
      <div className="pcs__content">

        <div className="pcs__info">
          <Skeleton variant="text" className="pcs__title" />
          <Skeleton variant="text" className="pcs__price" />
        </div>

        {/* Descripcion */}
        <Skeleton variant="text" className="pcs__line" />
        <Skeleton variant="text" className="pcs__line pcs__line--mid" />
        <Skeleton variant="text" className="pcs__line pcs__line--short" />

        {/* like y el guardar*/}
        <div className="pcs__footer">
          <Skeleton className="pcs__like" />
          <div className="pcs__footer-actions">
            <Skeleton className="pcs__footer-btn" />
            <Skeleton className="pcs__footer-btn" />
          </div>
        </div>

      </div>
    </div>
  );
}