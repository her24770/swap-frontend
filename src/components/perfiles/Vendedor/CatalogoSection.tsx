import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import { InfoHint } from "../../ui/InfoHint/InfoHint";
import { PerfilPostCarouselSkeleton } from "../perfilLoading";
import { getPostCardInfoItems, type CatalogPost } from "./catalogoVendedor";

interface CatalogoSectionProps {
  title: string;
  createLabel: string;
  emptyMessage: string;
  canCreate: boolean;
  onCreate: () => void;
  loading: boolean;
  error: string | null;
  posts: CatalogPost[];
  renderCard: (pub: CatalogPost) => ReactNode;
}

// Estructura de los catálogos para reutlizar barra de título, estados de carga/error/vacío y carrusel
export default function CatalogoSection({
  title,
  createLabel,
  emptyMessage,
  canCreate,
  onCreate,
  loading,
  error,
  posts,
  renderCard,
}: CatalogoSectionProps) {
  const t = useTranslations("perfil");

  return (
    <section className="perfil-page__section">
      <div className="perfil-page__catalog-bar">
        <h2 className="perfil-page__catalog-bar-title">{title}</h2>
        {canCreate && (
          <div className="perfil-page__catalog-bar-actions">
            <button type="button" className="perfil-page__new-publication-btn" onClick={onCreate}>
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {createLabel}
            </button>
            <InfoHint ariaLabel={t("hints.catalogAria")} items={getPostCardInfoItems(t)} />
          </div>
        )}
      </div>

      {loading && <PerfilPostCarouselSkeleton count={4} />}
      {error && <p className="perfil-page__coming-soon perfil-page__coming-soon--error">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="perfil-page__coming-soon">{emptyMessage}</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <HorizontalCarousel>
          {posts.map((pub) => (
            <div key={pub.id} className="h-carousel__item">
              {renderCard(pub)}
            </div>
          ))}
        </HorizontalCarousel>
      )}
    </section>
  );
}
