import { Skeleton } from '../../../../ui/Skeleton/Skeleton';
import './UserProfileHeaderSkeleton.css';

export function UserProfileHeaderSkeleton() {
  return (
    <div className="uphs" aria-label="Cargando perfil..." aria-busy="true">

      <div className="uphs__avatar-col">
        <Skeleton variant="circle" className="uphs__avatar" />
        {/* Estrellas */}
        <Skeleton className="uphs__stars" />
      </div>

      <div className="uphs__info-col">
        {/* Nombre + botón editar */}
        <div className="uphs__name-row">
          <Skeleton variant="text" className="uphs__name" />
          <Skeleton className="uphs__edit-btn" />
        </div>
        {/* Descripción: 3 líneas */}
        <Skeleton variant="text" className="uphs__line" />
        <Skeleton variant="text" className="uphs__line uphs__line--mid" />
        <Skeleton variant="text" className="uphs__line uphs__line--short" />
        <div className="uphs__payment">
          <Skeleton variant="circle" className="uphs__payment-icon" />
          <Skeleton variant="text" className="uphs__payment-text" />
        </div>
      </div>

      {/* ── Columna lateral (tags + contacto) ── */}
      <div className="uphs__side-col">
        {/* Tags */}
        <div className="uphs__tags">
          <Skeleton className="uphs__tag" />
          <Skeleton className="uphs__tag" />
          <Skeleton className="uphs__tag uphs__tag--wide" />
        </div>
        {/* Bloque contacto */}
        <div className="uphs__contact">
          <Skeleton variant="text" className="uphs__contact-label" />
          <Skeleton variant="text" className="uphs__contact-line" />
          <Skeleton variant="text" className="uphs__contact-line uphs__contact-line--short" />
        </div>
      </div>

    </div>
  );
}