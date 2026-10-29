import Image from "next/image";
import { Eye } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import type { Publicacion } from "../../../types/publicacion";
import AccionesPublicacion from "./AccionesPublicacion";
import "../../ui/Button/Button.css";

function getImage(publicacion: Publicacion): string {
  return normalizeImageUrl(publicacion.imagenes?.[0]?.url_imagen ?? "");
}

function formatFecha(fecha: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

interface PublicacionModeracionCardProps {
  publicacion: Publicacion;
  busy: boolean;
  onDetalle: (publicacion: Publicacion) => void;
  onBajar: (publicacion: Publicacion) => void;
  onReactivar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
}

export default function PublicacionModeracionCard({
  publicacion,
  busy,
  onDetalle,
  onBajar,
  onReactivar,
  onEliminar,
}: PublicacionModeracionCardProps) {
  const t = useTranslations("moderacion.publicaciones");
  const locale = useLocale();
  const imagen = getImage(publicacion);

  return (
    <article className="moderacion-publicaciones__card">
      <div className="moderacion-publicaciones__image">
        {imagen ? (
          <Image src={imagen} alt={publicacion.titulo} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
        ) : (
          <span>{t("card.sinImagen")}</span>
        )}
      </div>

      <div className="moderacion-publicaciones__content">
        <div className="moderacion-publicaciones__meta">
          <span className="moderacion-publicaciones__badge">
            {publicacion.tipoPerfil?.tipo_perfil
              ? t.has(`tipos.${publicacion.tipoPerfil.tipo_perfil}`)
                ? t(`tipos.${publicacion.tipoPerfil.tipo_perfil}`)
                : publicacion.tipoPerfil.tipo_perfil
              : t("card.sinTipo")}
          </span>
          <span className={`moderacion-publicaciones__estado moderacion-publicaciones__estado--${publicacion.estadoRel?.estado ?? "desconocido"}`}>
            {publicacion.estadoRel?.estado
              ? t.has(`estados.${publicacion.estadoRel.estado}`)
                ? t(`estados.${publicacion.estadoRel.estado}`)
                : publicacion.estadoRel.estado
              : t("card.estadoFallback", { estado: publicacion.estado })}
          </span>
        </div>

        <h2 className="moderacion-publicaciones__card-title">{publicacion.titulo}</h2>
        <p className="moderacion-publicaciones__description">{publicacion.descripcion}</p>

        <div className="moderacion-publicaciones__seller">
          <span>{publicacion.usuario?.nombre ?? t("card.usuarioDesconocido")}</span>
          <span>{publicacion.usuario?.email_institucional ?? t("card.sinCorreo")}</span>
        </div>

        <div className="moderacion-publicaciones__footer">
          <div>
            <strong>Q{Number(publicacion.precio).toFixed(2)}</strong>
            <span>{formatFecha(publicacion.fecha_publicacion, locale)}</span>
          </div>
          <button
            type="button"
            className="button button--small"
            onClick={() => onDetalle(publicacion)}
          >
            <Eye size={14} />
            {t("acciones.detalle")}
          </button>
        </div>

        <AccionesPublicacion
          publicacion={publicacion}
          onBajar={onBajar}
          onReactivar={onReactivar}
          onEliminar={onEliminar}
          busy={busy}
        />
      </div>
    </article>
  );
}
