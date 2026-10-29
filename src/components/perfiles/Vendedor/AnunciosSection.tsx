import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import AdBanner from "./AdBanner/AdBanner";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import { InfoHint } from "../../ui/InfoHint/InfoHint";
import type { Anuncio } from "../../../types/anuncio";
import { PerfilAdBannerSkeleton } from "../perfilLoading";
import { getAdBannerInfoItems } from "./catalogoVendedor";

interface AnunciosSectionProps {
  anuncios: Anuncio[] | null | undefined;
  loading: boolean;
  error: string | null | undefined;
  canCreate: boolean;
  onCrear: () => void;
  onEditar: (anuncio: Anuncio) => void;
  onEliminar: (idAnuncio: number) => void;
}

// Sección de anuncios
export default function AnunciosSection({
  anuncios,
  loading,
  error,
  canCreate,
  onCrear,
  onEditar,
  onEliminar,
}: AnunciosSectionProps) {
  const t = useTranslations("perfil");

  return (
    <section className="perfil-page__section">
      <div className="perfil-page__catalog-bar">
        <h2 className="perfil-page__catalog-bar-title">{t("sections.ads")}</h2>
        {canCreate && (
          <div className="perfil-page__catalog-bar-actions">
            <button type="button" className="perfil-page__new-publication-btn" onClick={onCrear}>
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.createAd")}
            </button>
            <InfoHint ariaLabel={t("hints.adsAria")} items={getAdBannerInfoItems(t)} />
          </div>
        )}
      </div>

      {loading && <PerfilAdBannerSkeleton showActions={canCreate} />}

      {error && (
        <p className="perfil-page__coming-soon perfil-page__coming-soon--error">{error}</p>
      )}

      {!loading && !error && anuncios && anuncios.length === 0 && (
        <p className="perfil-page__coming-soon">{t("sections.emptyAds")}</p>
      )}

      {!loading && !error && anuncios && anuncios.length > 0 && (
        <AnunciosCarousel>
          {anuncios.map((ad) => (
            <div key={ad.id_anuncio} className="h-carousel__item">
              <AdBanner
                imageUrl={ad.imagen_url}
                title={ad.titulo}
                description={ad.descripcion}
                onEditClick={() => onEditar(ad)}
                onDeleteClick={() => onEliminar(ad.id_anuncio)}
              />
            </div>
          ))}
        </AnunciosCarousel>
      )}
    </section>
  );
}
