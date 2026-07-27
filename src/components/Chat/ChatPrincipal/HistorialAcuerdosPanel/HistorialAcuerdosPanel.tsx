"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "../../../../i18n/routing";
import { acuerdoService } from "../../../../services/acuerdoService";
import type { AcuerdoHistorial } from "../../../../types/acuerdo";
import PostImage from "../../../posts/PostCard/PostImage/PostImage";
import DetallePublicacion from "../../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import { Skeleton } from "../../../ui/Skeleton/Skeleton";
import "./HistorialAcuerdosPanel.css";

interface HistorialAcuerdosPanelProps {
  idConversacion: number;
}

type GrupoEstado = "pendiente" | "activo" | "cancelado" | "completado";

const ORDEN_GRUPOS: GrupoEstado[] = ["pendiente", "activo", "cancelado", "completado"];

export default function HistorialAcuerdosPanel({ idConversacion }: HistorialAcuerdosPanelProps) {
  const t = useTranslations("chat.history");
  const locale = useLocale();
  const router = useRouter();
  const [acuerdos, setAcuerdos] = useState<AcuerdoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAcuerdo, setSelectedAcuerdo] = useState<AcuerdoHistorial | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    acuerdoService
      .getPorConversacion(idConversacion)
      .then((data) => {
        if (isMounted) setAcuerdos(data);
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
  }, [idConversacion, t]);

  if (loading) {
    return (
      <div className="historial-panel">
        {Array.from({ length: 3 }).map((_, index) => (
          <HistorialPanelItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="historial-panel__empty">{error}</p>;
  }

  const grupos = ORDEN_GRUPOS.map((estado) => ({
    estado,
    items: acuerdos
      .filter((acuerdo) => acuerdo.estadoRel?.estado === estado)
      .sort((a, b) => {
        const fechaA = new Date(a.fecha_entrega).getTime();
        const fechaB = new Date(b.fecha_entrega).getTime();
        return estado === "completado" ? fechaB - fechaA : fechaA - fechaB;
      }),
  })).filter((grupo) => grupo.items.length > 0);

  if (grupos.length === 0) {
    return <p className="historial-panel__empty">{t("empty")}</p>;
  }

  return (
    <div className="historial-panel">
      {grupos.map(({ estado, items }) => (
        <section key={estado} className="historial-panel__group">
          <h4 className="historial-panel__group-title">
            {t(`groups.${estado}`)}
            <span className="historial-panel__group-count">{items.length}</span>
          </h4>
          <div className="historial-panel__list">
            {items.map((acuerdo) => (
              <HistorialPanelItem
                key={acuerdo.id_acuerdo}
                acuerdo={acuerdo}
                locale={locale}
                onClick={() => setSelectedAcuerdo(acuerdo)}
              />
            ))}
          </div>
        </section>
      ))}

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
    </div>
  );
}

function HistorialPanelItem({
  acuerdo,
  locale,
  onClick,
}: {
  acuerdo: AcuerdoHistorial;
  locale: string;
  onClick: () => void;
}) {
  const publicacion = acuerdo.publicacion;
  const precio = Number(publicacion.precio);
  const fecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(acuerdo.fecha_entrega));

  return (
    <button type="button" className="historial-panel__item" onClick={onClick}>
      <div className="historial-panel__thumb">
        <PostImage
          images={publicacion.imagenes.map((imagen) => imagen.url_imagen)}
          alt={publicacion.titulo}
          compact
        />
      </div>
      <div className="historial-panel__info">
        <span className="historial-panel__title">{publicacion.titulo}</span>
        <span className="historial-panel__price">
          Q{Number.isFinite(precio) ? precio.toFixed(2) : publicacion.precio}
        </span>
        <span className="historial-panel__meta-row">
          <CalendarDays size={12} aria-hidden="true" />
          {fecha}
        </span>
        <span className="historial-panel__meta-row">
          <MapPin size={12} aria-hidden="true" />
          <span className="historial-panel__meta-text">{acuerdo.lugar_entrega}</span>
        </span>
      </div>
      <ChevronRight size={14} className="historial-panel__chevron" aria-hidden="true" />
    </button>
  );
}

function HistorialPanelItemSkeleton() {
  return (
    <div className="historial-panel__item historial-panel__item--skeleton">
      <Skeleton className="historial-panel__thumb-skeleton" />
      <div className="historial-panel__info">
        <Skeleton variant="text" className="historial-panel__title-skeleton" />
        <Skeleton variant="text" className="historial-panel__meta-skeleton" />
        <Skeleton variant="text" className="historial-panel__meta-skeleton" />
      </div>
    </div>
  );
}
