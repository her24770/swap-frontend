import { Skeleton } from "../ui/Skeleton/Skeleton";
import { SkeletonHorizontalCarousel } from "../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel";
import { PostCardSkeleton } from "../posts/PostCard/PostCardSkeleton/PostCardSkeleton";
import { AdBannerSkeleton } from "./Vendedor/AdBanner/AdBannerSkeleton/AdBannerSkeleton";
import { HorarioSkeleton } from "./Tutor/Horario/HorarioSkeleton/HorarioSkeleton";
import "../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel.css";

export function PerfilModeToggleSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="perfil-page__mode-toolbar">
      <div className="perfil-page__mode-toggle" aria-busy="true" aria-label="Loading profile modes">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="perfil-page__mode-btn-skeleton" />
        ))}
      </div>
    </div>
  );
}

export function PerfilPurchasesCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="perfil-page__carousel-wrap">
      <div className="carousel-skeleton" aria-busy="true" aria-label="Loading purchases">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="perfil-page__purchase-item">
            <PostCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerfilPostCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="perfil-page__carousel-wrap">
      <SkeletonHorizontalCarousel count={count} renderItem={() => <PostCardSkeleton />} />
    </div>
  );
}

export function PerfilAdBannerSkeleton({ showActions = false }: { showActions?: boolean }) {
  return <AdBannerSkeleton showActions={showActions} />;
}

function PerfilSectionTitleSkeleton() {
  return (
    <div className="perfil-page__catalog-bar">
      <Skeleton variant="text" className="perfil-page__section-title-skeleton" />
    </div>
  );
}

export function VistaVendedorSectionsSkeleton() {
  return (
    <>
      <section className="perfil-page__section">
        <PerfilSectionTitleSkeleton />
        <PerfilAdBannerSkeleton />
      </section>
      <section className="perfil-page__section">
        <PerfilSectionTitleSkeleton />
        <PerfilPostCarouselSkeleton count={4} />
      </section>
      <section className="perfil-page__section">
        <PerfilSectionTitleSkeleton />
        <PerfilPostCarouselSkeleton count={4} />
      </section>
    </>
  );
}

export function VistaTutorSectionsSkeleton() {
  return (
    <>
      <section className="perfil-page__section">
        <PerfilSectionTitleSkeleton />
        <PerfilPostCarouselSkeleton count={4} />
      </section>
      <section className="perfil-page__section">
        <PerfilSectionTitleSkeleton />
        <HorarioSkeleton />
      </section>
    </>
  );
}
