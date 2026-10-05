"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, Loader2, Trash2, Ban, RotateCcw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import SearchBar from "../../ui/SearchBar/SearchBar";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import JustificanteModeracionModal from "../../ui/Modal/Reporte/JustificanteModeracionModal";
import { publicacionService } from "../../../services/publicacionService";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import { useToast } from "../../../hooks/useToast";
import type { Publicacion, PublicacionModeracionFilters } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";
import "../../ui/Button/Button.css";
import "./PublicacionesModeracion.css";

const ITEMS_PER_PAGE = 12;

const TIPOS = [
  { value: "", labelKey: "tipos.todos" },
  { value: "negocio", labelKey: "tipos.negocio" },
  { value: "material", labelKey: "tipos.material" },
  { value: "tutoria", labelKey: "tipos.tutoria" },
] as const;

const ESTADOS = [
  { value: "", labelKey: "estados.todos" },
  { value: "activo", labelKey: "estados.activo" },
  { value: "inactivo", labelKey: "estados.inactivo" },
  { value: "disponible", labelKey: "estados.disponible" },
  { value: "reservado", labelKey: "estados.reservado" },
  { value: "vendido", labelKey: "estados.vendido" },
] as const;

function tagsFromPublicacion(publicacion: Publicacion): Tag[] {
  return publicacion.etiquetas?.map((rel) => ({
    id: rel.etiqueta.id_etiqueta,
    name: rel.etiqueta.nombre,
    parentId: rel.etiqueta.id_etiqueta_padre,
  })) ?? [];
}

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

interface AccionesPublicacionProps {
  publicacion: Publicacion;
  onBajar: (publicacion: Publicacion) => void;
  onReactivar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
  busy: boolean;
}

function AccionesPublicacion({ publicacion, onBajar, onReactivar, onEliminar, busy }: AccionesPublicacionProps) {
  const t = useTranslations("moderacion.publicaciones");
  const estaInactiva = publicacion.estadoRel?.estado === "inactivo";

  return (
    <div className="moderacion-publicaciones__actions">
      {estaInactiva ? (
        <button
          type="button"
          className="button button--medium"
          onClick={() => onReactivar(publicacion)}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <RotateCcw size={16} />}
          {t("acciones.reactivar")}
        </button>
      ) : (
        <button
          type="button"
          className="button button--medium button--warning"
          onClick={() => onBajar(publicacion)}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Ban size={16} />}
          {t("acciones.bajar")}
        </button>
      )}
      <button
        type="button"
        className="button button--medium moderacion-publicaciones__danger-btn"
        onClick={() => onEliminar(publicacion)}
        disabled={busy}
      >
        {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Trash2 size={16} />}
        {t("acciones.eliminar")}
      </button>
    </div>
  );
}

type AccionModeracion = "bajar" | "reactivar" | "eliminar";

interface JustificantePendiente {
  accion: AccionModeracion;
  publicacion: Publicacion;
}

export default function PublicacionesModeracion() {
  const t = useTranslations("moderacion.publicaciones");
  const locale = useLocale();
  const toast = useToast();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<PublicacionModeracionFilters["tipo"] | "">("");
  const [estado, setEstado] = useState("");
  const [sort, setSort] = useState<NonNullable<PublicacionModeracionFilters["sort"]>>("fecha");
  const [order, setOrder] = useState<NonNullable<PublicacionModeracionFilters["order"]>>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Publicacion | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [justificantePendiente, setJustificantePendiente] = useState<JustificantePendiente | null>(null);

  const motivosReactivacion = useMemo(
    () => [
      t("motivosReactivacion.errorModeracion"),
      t("motivosReactivacion.revisadaPermitida"),
      t("motivosReactivacion.correccionUsuario"),
    ],
    [t]
  );

  const pageCount = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const filters = useMemo<PublicacionModeracionFilters>(() => ({
    q,
    tipo: tipo || undefined,
    estado: estado || undefined,
    sort,
    order,
    page,
    limit: ITEMS_PER_PAGE,
  }), [estado, order, page, q, sort, tipo]);

  const cargarPublicaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicacionService.getModeracion(filters);
      setPublicaciones(response.publicaciones);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errorCarga");
      setError(message);
      setPublicaciones([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    void cargarPublicaciones();
  }, [cargarPublicaciones]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setQ(qDraft.trim());
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [qDraft]);

  const updateLocalPublicacion = (id: number, updater: (publicacion: Publicacion) => Publicacion) => {
    setPublicaciones((prev) => prev.map((pub) => pub.id_publicacion === id ? updater(pub) : pub));
    setSelected((prev) => prev?.id_publicacion === id ? updater(prev) : prev);
  };

  const abrirJustificante = (accion: AccionModeracion, publicacion: Publicacion) => {
    setJustificantePendiente({ accion, publicacion });
  };

  const ejecutarAccionModeracion = async (payload: { motivo: string; detalle: string }) => {
    if (!justificantePendiente) return;

    const { accion, publicacion } = justificantePendiente;

    try {
      setBusyId(publicacion.id_publicacion);

      if (accion === "bajar") {
        await publicacionService.bajarModeracion(publicacion.id_publicacion, payload);
        updateLocalPublicacion(publicacion.id_publicacion, (pub) => ({
          ...pub,
          estadoRel: { id_estado: pub.estadoRel?.id_estado ?? pub.estado, estado: "inactivo" },
        }));
        toast.success(t("toasts.bajadaSuccess"));
      }

      if (accion === "reactivar") {
        await publicacionService.reactivarModeracion(publicacion.id_publicacion, payload);
        updateLocalPublicacion(publicacion.id_publicacion, (pub) => ({
          ...pub,
          estadoRel: { id_estado: pub.estadoRel?.id_estado ?? pub.estado, estado: "activo" },
        }));
        toast.success(t("toasts.reactivadaSuccess"));
      }

      if (accion === "eliminar") {
        await publicacionService.eliminarModeracion(publicacion.id_publicacion, payload);
        setPublicaciones((prev) => prev.filter((pub) => pub.id_publicacion !== publicacion.id_publicacion));
        setTotal((prev) => Math.max(0, prev - 1));
        setSelected((prev) => prev?.id_publicacion === publicacion.id_publicacion ? null : prev);
        toast.success(t("toasts.eliminadaSuccess"));
      }

      setJustificantePendiente(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errorAccion"));
    } finally {
      setBusyId(null);
    }
  };

  const tituloJustificante = justificantePendiente?.accion === "bajar"
    ? t("justificante.titulos.bajar")
    : justificantePendiente?.accion === "reactivar"
      ? t("justificante.titulos.reactivar")
      : t("justificante.titulos.eliminar");

  const preguntaJustificante = justificantePendiente?.accion === "reactivar"
    ? t("justificante.preguntas.reactivar")
    : justificantePendiente?.accion === "eliminar"
      ? t("justificante.preguntas.eliminar")
      : t("justificante.preguntas.bajar");

  return (
    <main className="moderacion-publicaciones">
      <div className="moderacion-publicaciones__header">
        <div>
          <h1 className="moderacion-publicaciones__title">{t("title")}</h1>
          <p className="moderacion-publicaciones__subtitle">
            {t("subtitle")}
          </p>
        </div>
        <span className="moderacion-publicaciones__count">{t("resultsCount", { count: total })}</span>
      </div>

      <div className="moderacion-publicaciones__filters">
        <SearchBar
          value={qDraft}
          onChange={setQDraft}
          placeholder={t("searchPlaceholder")}
        />
        <select
          className="moderacion-publicaciones__select"
          value={tipo}
          onChange={(event) => {
            setTipo(event.target.value as typeof tipo);
            setPage(1);
          }}
        >
          {TIPOS.map((option) => (
            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
        <select
          className="moderacion-publicaciones__select"
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value);
            setPage(1);
          }}
        >
          {ESTADOS.map((option) => (
            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
        <select
          className="moderacion-publicaciones__select"
          value={`${sort}:${order}`}
          onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(":");
            setSort(nextSort as typeof sort);
            setOrder(nextOrder as typeof order);
            setPage(1);
          }}
        >
          <option value="fecha:desc">{t("sort.fechaDesc")}</option>
          <option value="fecha:asc">{t("sort.fechaAsc")}</option>
          <option value="me_gusta:desc">{t("sort.meGustaDesc")}</option>
          <option value="precio:desc">{t("sort.precioDesc")}</option>
          <option value="precio:asc">{t("sort.precioAsc")}</option>
        </select>
      </div>

      {error && <p className="moderacion-publicaciones__error">{error}</p>}

      {loading ? (
        <div className="moderacion-publicaciones__loading">
          <Loader2 className="moderacion-publicaciones__spinner" size={24} />
          {t("loading")}
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="moderacion-publicaciones__empty">{t("empty")}</div>
      ) : (
        <div className="moderacion-publicaciones__grid">
          {publicaciones.map((publicacion) => {
            const imagen = getImage(publicacion);
            const busy = busyId === publicacion.id_publicacion;

            return (
              <article key={publicacion.id_publicacion} className="moderacion-publicaciones__card">
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
                      onClick={() => setSelected(publicacion)}
                    >
                      <Eye size={14} />
                      {t("acciones.detalle")}
                    </button>
                  </div>

                  <AccionesPublicacion
                    publicacion={publicacion}
                    onBajar={(pub) => abrirJustificante("bajar", pub)}
                    onReactivar={(pub) => abrirJustificante("reactivar", pub)}
                    onEliminar={(pub) => abrirJustificante("eliminar", pub)}
                    busy={busy}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="moderacion-publicaciones__pagination">
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || loading}
        >
          <ChevronLeft size={14} />
          {t("pagination.anterior")}
        </button>
        <span>{t("pagination.paginaInfo", { page, pageCount })}</span>
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          disabled={page >= pageCount || loading}
        >
          {t("pagination.siguiente")}
          <ChevronRight size={14} />
        </button>
      </div>

      {selected && (
        <DetallePublicacion
          isOpen
          onClose={() => setSelected(null)}
          type={selected.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
          title={selected.titulo}
          price={Number(selected.precio)}
          description={selected.descripcion}
          imagenes={selected.imagenes}
          tags={tagsFromPublicacion(selected)}
          likes={selected.me_gusta}
          publicacionId={selected.id_publicacion}
          sellerName={selected.usuario?.nombre ?? t("card.usuarioDesconocido")}
          sellerRating={selected.usuario?.calificacion ?? 0}
          sellerId={selected.usuario?.id_usuario}
          sellerImageUrl={selected.usuario?.url_foto_perfil}
          estado={selected.estadoRel?.estado ?? selected.estado}
          soloLectura
          showActions={false}
          actionsSlot={(
            <AccionesPublicacion
              publicacion={selected}
              onBajar={(pub) => abrirJustificante("bajar", pub)}
              onReactivar={(pub) => abrirJustificante("reactivar", pub)}
              onEliminar={(pub) => abrirJustificante("eliminar", pub)}
              busy={busyId === selected.id_publicacion}
            />
          )}
        />
      )}

      {justificantePendiente && (
        <JustificanteModeracionModal
          isOpen
          tipoObjetivo="publicacion"
          titulo={tituloJustificante}
          pregunta={preguntaJustificante}
          motivosPersonalizados={justificantePendiente.accion === "reactivar" ? motivosReactivacion : undefined}
          enviando={busyId === justificantePendiente.publicacion.id_publicacion}
          onClose={() => setJustificantePendiente(null)}
          onSubmit={ejecutarAccionModeracion}
        />
      )}
    </main>
  );
}
