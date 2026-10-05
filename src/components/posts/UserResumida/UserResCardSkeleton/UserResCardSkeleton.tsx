import { Skeleton } from '../../../ui/Skeleton/Skeleton';
import './UserResCardSkeleton.css';

export function UserResCardSkeleton() {
  return (
    <div className="urcs" aria-label="Cargando usuario..." aria-busy="true">

      <Skeleton variant="circle" className="urcs__avatar" />

      <div className="urcs__content">
        <Skeleton variant="text" className="urcs__name" />
        <Skeleton className="urcs__stars" />
        <div className="urcs__footer">
          <Skeleton className="urcs__btn" />
        </div>
      </div>

    </div>
  );
}