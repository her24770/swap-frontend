"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, Loader2, Trash2, Ban, RotateCcw } from "lucide-react";
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
  { value: "", label: "Todos los tipos" },
  { value: "negocio", label: "Negocios" },
  { value: "material", label: "Materiales" },
  { value: "tutoria", label: "Tutorías" },
] as const;

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "disponible", label: "Disponible" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
] as const;

const MOTIVOS_REACTIVACION = [
  "Error de moderación",
  "Publicación revisada y permitida",
  "Corrección aplicada por el usuario",
];

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

function formatFecha(fecha: string): string {
  return new Intl.DateTimeFormat("es-GT", {
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
          Reactivar
        </button>
      ) : (
        <button
          type="button"
          className="button button--medium button--warning"
          onClick={() => onBajar(publicacion)}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Ban size={16} />}
          Bajar publicación
        </button>
      )}
      <button
        type="button"
        className="button button--medium moderacion-publicaciones__danger-btn"
        onClick={() => onEliminar(publicacion)}
        disabled={busy}
      >
        {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Trash2 size={16} />}
        Eliminar
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
      const message = err instanceof Error ? err.message : "No fue posible cargar publicaciones.";
      setError(message);
      setPublicaciones([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
        toast.success("Publicación bajada exitosamente.");
      }

      if (accion === "reactivar") {
        await publicacionService.reactivarModeracion(publicacion.id_publicacion, payload);
        updateLocalPublicacion(publicacion.id_publicacion, (pub) => ({
          ...pub,
          estadoRel: { id_estado: pub.estadoRel?.id_estado ?? pub.estado, estado: "activo" },
        }));
        toast.success("Publicación reactivada exitosamente.");
      }

      if (accion === "eliminar") {
        await publicacionService.eliminarModeracion(publicacion.id_publicacion, payload);
        setPublicaciones((prev) => prev.filter((pub) => pub.id_publicacion !== publicacion.id_publicacion));
        setTotal((prev) => Math.max(0, prev - 1));
        setSelected((prev) => prev?.id_publicacion === publicacion.id_publicacion ? null : prev);
        toast.success("Publicación eliminada exitosamente.");
      }

      setJustificantePendiente(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No fue posible completar la acción.");
    } finally {
      setBusyId(null);
    }
  };

  const tituloJustificante = justificantePendiente?.accion === "bajar"
    ? "Bajar publicación"
    : justificantePendiente?.accion === "reactivar"
      ? "Reactivar publicación"
      : "Eliminar publicación";

  const preguntaJustificante = justificantePendiente?.accion === "reactivar"
    ? "¿Por qué quieres reactivar la publicación?"
    : justificantePendiente?.accion === "eliminar"
      ? "¿Por qué quieres eliminar la publicación?"
      : "¿Por qué quieres bajar la publicación?";

  return (
    <main className="moderacion-publicaciones">
      <div className="moderacion-publicaciones__header">
        <div>
          <h1 className="moderacion-publicaciones__title">Publicaciones</h1>
          <p className="moderacion-publicaciones__subtitle">
            Visualiza, filtra y modera publicaciones de toda la plataforma.
          </p>
        </div>
        <span className="moderacion-publicaciones__count">{total} resultados</span>
      </div>

      <div className="moderacion-publicaciones__filters">
        <SearchBar
          value={qDraft}
          onChange={setQDraft}
          placeholder="Buscar por título, descripción, usuario o correo"
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
            <option key={option.value} value={option.value}>{option.label}</option>
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
            <option key={option.value} value={option.value}>{option.label}</option>
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
          <option value="fecha:desc">Más recientes</option>
          <option value="fecha:asc">Más antiguas</option>
          <option value="me_gusta:desc">Más likes</option>
          <option value="precio:desc">Mayor precio</option>
          <option value="precio:asc">Menor precio</option>
        </select>
      </div>

      {error && <p className="moderacion-publicaciones__error">{error}</p>}

      {loading ? (
        <div className="moderacion-publicaciones__loading">
          <Loader2 className="moderacion-publicaciones__spinner" size={24} />
          Cargando publicaciones...
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="moderacion-publicaciones__empty">No hay publicaciones que coincidan con los filtros.</div>
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
                    <span>Sin imagen</span>
                  )}
                </div>

                <div className="moderacion-publicaciones__content">
                  <div className="moderacion-publicaciones__meta">
                    <span className="moderacion-publicaciones__badge">{publicacion.tipoPerfil?.tipo_perfil ?? "Sin tipo"}</span>
                    <span className={`moderacion-publicaciones__estado moderacion-publicaciones__estado--${publicacion.estadoRel?.estado ?? "desconocido"}`}>
                      {publicacion.estadoRel?.estado ?? `Estado ${publicacion.estado}`}
                    </span>
                  </div>

                  <h2 className="moderacion-publicaciones__card-title">{publicacion.titulo}</h2>
                  <p className="moderacion-publicaciones__description">{publicacion.descripcion}</p>

                  <div className="moderacion-publicaciones__seller">
                    <span>{publicacion.usuario?.nombre ?? "Usuario desconocido"}</span>
                    <span>{publicacion.usuario?.email_institucional ?? "Sin correo"}</span>
                  </div>

                  <div className="moderacion-publicaciones__footer">
                    <div>
                      <strong>Q{Number(publicacion.precio).toFixed(2)}</strong>
                      <span>{formatFecha(publicacion.fecha_publicacion)}</span>
                    </div>
                    <button
                      type="button"
                      className="button button--small"
                      onClick={() => setSelected(publicacion)}
                    >
                      <Eye size={14} />
                      Detalle
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
          Anterior
        </button>
        <span>Página {page} de {pageCount}</span>
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          disabled={page >= pageCount || loading}
        >
          Siguiente
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
          sellerName={selected.usuario?.nombre ?? "Usuario desconocido"}
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
          motivosPersonalizados={justificantePendiente.accion === "reactivar" ? MOTIVOS_REACTIVACION : undefined}
          enviando={busyId === justificantePendiente.publicacion.id_publicacion}
          onClose={() => setJustificantePendiente(null)}
          onSubmit={ejecutarAccionModeracion}
        />
      )}
    </main>
  );
}
