import { Skeleton } from '../../../../ui/Skeleton/Skeleton';
import './AdBannerSkeleton.css';

interface AdBannerSkeletonProps {
  showActions?: boolean; //true si puede editar
}

export function AdBannerSkeleton({ showActions = false }: AdBannerSkeletonProps) {
  return (
    <div className="abs" aria-label="Cargando anuncio..." aria-busy="true">

      {/* Botones editar/eliminar opcionales */}
      {showActions && (
        <div className="abs__actions">
          <Skeleton className="abs__action-btn" />
          <Skeleton className="abs__action-btn" />
        </div>
      )}

      <div className="abs__content">
        <Skeleton className="abs__badge" />
        <Skeleton className="abs__title" />
        <Skeleton variant="text" className="abs__desc" />
      </div>

    </div>
  );
}