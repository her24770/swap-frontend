"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "../../../../i18n/routing";
import { acuerdoService } from "../../../../services/acuerdoService";
import type { AcuerdoHistorial, TipoCompraHistorial, TipoHistorialAcuerdo } from "../../../../types/acuerdo";
import PostImage from "../../../posts/PostCard/PostImage/PostImage";
import HorizontalCarousel from "../../../ui/HorizontalCarousel/HorizontalCarousel";
import DetallePublicacion from "../../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import CompraFilterTabs from "./CompraFilterTabs";
import { Skeleton } from "../../../ui/Skeleton/Skeleton";
import "../../../ui/Button/Button.css";
import "../../../pages/PublicacionesList/PublicacionesList.css";
import "./HistorialAcuerdos.css";

interface HistorialAcuerdosProps {
  idUsuario?: number;
  tipo: TipoHistorialAcuerdo;
  title: string;
  emptyMessage: string;
  variant?: "carousel" | "grid";
  currentPage?: number;
  itemsPerPage?: number;
  showViewAllButton?: boolean;
  viewAllHref?: string;
  showCompraFilter?: boolean;
  compraFilter?: TipoCompraHistorial;
  onCompraFilterChange?: (filter: TipoCompraHistorial) => void;
  searchQuery?: string;
}

const DEFAULT_PROFILE_LIMIT = 10;
const DEFAULT_ITEMS_PER_PAGE = 12;
const VISIBLE_PAGINATION_PAGES = 5;

export default function HistorialAcuerdos({
  idUsuario,
  tipo,
  title,
  emptyMessage,
  variant = "carousel",
  currentPage = 1,
  itemsPerPage,
  showViewAllButton = false,
  viewAllHref,
  showCompraFilter = false,
  compraFilter = "producto",
  onCompraFilterChange,
  searchQuery = "",
}: HistorialAcuerdosProps) {
  const t = useTranslations("perfil.history");
  const locale = useLocale();
  const router = useRouter();
  const [acuerdos, setAcuerdos] = useState<AcuerdoHistorial[]>([]);
  const [selectedAcuerdo, setSelectedAcuerdo] = useState<AcuerdoHistorial | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(idUsuario));
  const [error, setError] = useState<string | null>(null);
  const limit = itemsPerPage ?? (variant === "carousel" ? DEFAULT_PROFILE_LIMIT : DEFAULT_ITEMS_PER_PAGE);
  const requestTipo = tipo === "producto" ? compraFilter : tipo;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const hasPagination = variant === "grid" && total > limit;

  useEffect(() => {
    if (!idUsuario) {
      setLoading(false);
      setAcuerdos([]);
      setTotal(0);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    acuerdoService
      .getHistorialUsuario(idUsuario, requestTipo, { page: currentPage, limit, q: searchQuery })
      .then((result) => {
        if (!isMounted) return;
        setAcuerdos(result.data);
        setTotal(result.total);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || t("error"));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [idUsuario, requestTipo, currentPage, limit, searchQuery, t]);

  return (
    <section className={`perfil-page__section historial-acuerdos historial-acuerdos--${variant}`}>
      <div className="historial-acuerdos__header">
        <h2 className="perfil-page__section-title">{title}</h2>
        {showViewAllButton && viewAllHref && (
          <Link href={viewAllHref} className="perfil-page__secondary-btn historial-acuerdos__view-all">
            {t("viewAll")}
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>

      {showCompraFilter && (
        <CompraFilterTabs
          value={compraFilter}
          onChange={onCompraFilterChange}
        />
      )}

      {loading && <HistorialAcuerdosSkeleton variant={variant} count={variant === "grid" ? 8 : 4} />}

      {!loading && error && (
        <p className="perfil-page__coming-soon">{error}</p>
      )}

      {!loading && !error && acuerdos.length === 0 && (
        <p className="perfil-page__coming-soon">{emptyMessage}</p>
      )}

      {!loading && !error && acuerdos.length > 0 && (
        variant === "carousel" ? (
          <HorizontalCarousel>
            {acuerdos.map((acuerdo) => (
              <div key={acuerdo.id_acuerdo} className="h-carousel__item historial-acuerdos__item">
                <HistorialAcuerdoCard
                  acuerdo={acuerdo}
                  locale={locale}
                  onDetailsClick={() => setSelectedAcuerdo(acuerdo)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        ) : (
          <>
            <div className="historial-acuerdos__grid">
              {acuerdos.map((acuerdo) => (
                <HistorialAcuerdoCard
                  key={acuerdo.id_acuerdo}
                  acuerdo={acuerdo}
                  locale={locale}
                  onDetailsClick={() => setSelectedAcuerdo(acuerdo)}
                />
              ))}
            </div>
            {hasPagination && (
              <HistorialPagination
                currentPage={safeCurrentPage}
                pageCount={pageCount}
                tipo={tipo}
                compraFilter={compraFilter}
                searchQuery={searchQuery}
              />
            )}
          </>
        )
      )}

      {selectedAcuerdo && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedAcuerdo(null)}
          type={selectedAcuerdo.publicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
          title={selectedAcuerdo.publicacion.titulo}
          price={Number(selectedAcuerdo.publicacion.precio)}
          description={selectedAcuerdo.publicacion.descripcion}
          imagenes={selectedAcuerdo.publicacion.imagenes}
          likes={selectedAcuerdo.publicacion.me_gusta}
          publicacionId={selectedAcuerdo.publicacion.id_publicacion}
          sellerName={selectedAcuerdo.publicacion.usuario?.nombre ?? t("unknownUser")}
          sellerRating={Number(selectedAcuerdo.publicacion.usuario?.calificacion ?? 0)}
          sellerId={selectedAcuerdo.publicacion.usuario?.id_usuario}
          sellerImageUrl={selectedAcuerdo.publicacion.usuario?.url_foto_perfil}
          showActions={false}
          onSellerClick={(sellerId) => {
            const modo = selectedAcuerdo.publicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutor" : "vendedor";
            setSelectedAcuerdo(null);
            router.push(`/perfil/${sellerId}?modo=${modo}`);
          }}
        />
      )}
    </section>
  );
}

function HistorialPagination({
  currentPage,
  pageCount,
  tipo,
  compraFilter,
  searchQuery,
}: {
  currentPage: number;
  pageCount: number;
  tipo: TipoHistorialAcuerdo;
  compraFilter: TipoCompraHistorial;
  searchQuery: string;
}) {
  const visiblePages = Math.min(VISIBLE_PAGINATION_PAGES, pageCount);
  const halfWindow = Math.floor(visiblePages / 2);
  let startPage = currentPage - halfWindow;
  let endPage = startPage + visiblePages - 1;
  if (startPage < 1) {
    startPage = 1;
    endPage = visiblePages;
  }
  if (endPage > pageCount) {
    endPage = pageCount;
    startPage = Math.max(1, endPage - visiblePages + 1);
  }
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ tipo, page: page.toString() });
    if (tipo === "producto") params.set("compraTipo", compraFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    return `/perfil/historial?${params.toString()}`;
  };

  return (
    <div className="publicaciones-list__pagination" aria-label="Paginacion de historial">
      <Link
        href={pageHref(Math.max(currentPage - 1, 1))}
        className={`publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow${currentPage === 1 ? " historial-acuerdos__pagination-link--disabled" : ""}`}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        <ChevronLeft size={16} aria-hidden />
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          className={`publicaciones-list__pagination-btn${page === currentPage ? " publicaciones-list__pagination-btn--active" : ""}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}
      <Link
        href={pageHref(Math.min(currentPage + 1, pageCount))}
        className={`publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow${currentPage === pageCount ? " historial-acuerdos__pagination-link--disabled" : ""}`}
        aria-disabled={currentPage === pageCount}
        tabIndex={currentPage === pageCount ? -1 : undefined}
      >
        <ChevronRight size={16} aria-hidden />
      </Link>
    </div>
  );
}

function HistorialAcuerdosSkeleton({
  variant,
  count,
}: {
  variant: "carousel" | "grid";
  count: number;
}) {
  const items = Array.from({ length: count });

  if (variant === "carousel") {
    return (
      <HorizontalCarousel>
        {items.map((_, index) => (
          <div key={index} className="h-carousel__item historial-acuerdos__item">
            <HistorialAcuerdoCardSkeleton />
          </div>
        ))}
      </HorizontalCarousel>
    );
  }

  return (
    <div className="historial-acuerdos__grid" aria-busy="true" aria-label="Cargando historial">
      {items.map((_, index) => (
        <HistorialAcuerdoCardSkeleton key={index} />
      ))}
    </div>
  );
}

function HistorialAcuerdoCardSkeleton() {
  return (
    <article className="historial-card historial-card--skeleton">
      <Skeleton className="historial-card__media" />
      <div className="historial-card__body">
        <div className="historial-card__header">
          <Skeleton variant="text" className="historial-card__title-skeleton" />
          <Skeleton variant="text" className="historial-card__price-skeleton" />
        </div>
        <div className="historial-card__meta">
          <Skeleton variant="text" className="historial-card__meta-skeleton" />
          <Skeleton variant="text" className="historial-card__meta-skeleton" />
          <Skeleton variant="text" className="historial-card__meta-skeleton" />
        </div>
        <div className="historial-card__footer">
          <Skeleton className="historial-card__details-skeleton" />
        </div>
      </div>
    </article>
  );
}

function HistorialAcuerdoCard({
  acuerdo,
  locale,
  onDetailsClick,
}: {
  acuerdo: AcuerdoHistorial;
  locale: string;
  onDetailsClick: () => void;
}) {
  const t = useTranslations("perfil.history");
  const publicacion = acuerdo.publicacion;
  const vendedor = publicacion.usuario?.nombre ?? t("unknownUser");
  const fecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(acuerdo.fecha_entrega));
  const precio = Number(publicacion.precio);

  return (
    <article className="historial-card">
      <div className="historial-card__media">
        <PostImage
          images={publicacion.imagenes.map((imagen) => imagen.url_imagen)}
          alt={publicacion.titulo}
          compact
        />
      </div>

      <div className="historial-card__body">
        <div className="historial-card__header">
          <h3 className="historial-card__title">{publicacion.titulo}</h3>
          <span className="historial-card__price">Q{Number.isFinite(precio) ? precio.toFixed(2) : publicacion.precio}</span>
        </div>

        <dl className="historial-card__meta">
          <div className="historial-card__meta-row">
            <dt>
              <UserRound size={15} aria-hidden="true" />
              <span className="sr-only">{t("provider")}</span>
            </dt>
            <dd>{vendedor}</dd>
          </div>
          <div className="historial-card__meta-row">
            <dt>
              <CalendarDays size={15} aria-hidden="true" />
              <span className="sr-only">{t("date")}</span>
            </dt>
            <dd>{fecha}</dd>
          </div>
          <div className="historial-card__meta-row">
            <dt>
              <MapPin size={15} aria-hidden="true" />
              <span className="sr-only">{t("place")}</span>
            </dt>
            <dd>{acuerdo.lugar_entrega}</dd>
          </div>
        </dl>

        <div className="historial-card__footer">
          <button
            type="button"
            className="button button--small historial-card__details-btn"
            onClick={onDetailsClick}
          >
            {t("details")}
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
