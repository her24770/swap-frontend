import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, Calendar, Box } from "lucide-react";
import type { AcuerdoHistorial } from "../../../../types/acuerdo";
import type { PublicacionChatResumen } from "../../../../types/chat";
import "./AcuerdoBanner.css";

interface AcuerdoBannerProps {
  acuerdo?: AcuerdoHistorial | null;
  publicacion?: PublicacionChatResumen;
  esPropuestaPendiente?: boolean;
  esPropuestaEnviada?: boolean;
  onDetalles?: () => void;
  onCrear?: () => void;
}

export default function AcuerdoBanner({
  acuerdo,
  publicacion,
  esPropuestaPendiente = false,
  esPropuestaEnviada = false,
  onDetalles,
  onCrear,
}: AcuerdoBannerProps) {
  const t = useTranslations("chat.banner");
  const imagenPrincipal = acuerdo?.publicacion.imagenes[0]?.url_imagen;

  if (!acuerdo) {
    return (
      <div className="acuerdo-banner acuerdo-banner--empty">
        {publicacion ? (
          <>
            <div className="acuerdo-banner__img">
              {publicacion.imagenUrl ? (
                <Image
                  src={publicacion.imagenUrl}
                  alt={publicacion.titulo}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <span className="acuerdo-banner__img-placeholder">
                  <Box size={24} />
                </span>
              )}
            </div>
            <div className="acuerdo-banner__info">
              <span className="acuerdo-banner__label">{t("noAgreement")}</span>
              <span className="acuerdo-banner__name">{publicacion.titulo}</span>
            </div>
          </>
        ) : (
          <span className="acuerdo-banner__create-label">{t("noAgreement")}</span>
        )}
        {onCrear && (
          <button
            type="button"
            className="acuerdo-banner__btn-create"
            onClick={onCrear}
          >
            {t("createAgreement")}
          </button>
        )}
      </div>
    );
  }

  if (esPropuestaPendiente || esPropuestaEnviada) {
    return (
      <button
        type="button"
        className={`acuerdo-banner acuerdo-banner--proposal${esPropuestaEnviada ? " acuerdo-banner--proposal-sent" : ""}`}
        onClick={onDetalles}
      >
        <span className="acuerdo-banner__proposal-text">
          {esPropuestaPendiente
            ? t("pendingProposalReceived")
            : t("pendingProposalSent")}
        </span>
      </button>
    );
  }

  return (
    <div className="acuerdo-banner">
      <div className="acuerdo-banner__img">
        {imagenPrincipal ? (
          <Image
            src={imagenPrincipal}
            alt={acuerdo.publicacion.titulo}
            fill
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <span className="acuerdo-banner__img-placeholder">
            <Box size={24} />
          </span>
        )}
      </div>
      <div className="acuerdo-banner__info">
        <span className="acuerdo-banner__label">{t("nextAgreement")}</span>
        <span className="acuerdo-banner__name">{acuerdo.publicacion.titulo}</span>
        <div className="acuerdo-banner__meta">
          <span>
            <MapPin size={11} /> {acuerdo.lugar_entrega}
          </span>
          <span>
            <Calendar size={11} /> {acuerdo.fecha_entrega}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="acuerdo-banner__btn"
        onClick={onDetalles}
      >
        {t("details")}
      </button>
    </div>
  );
}
