import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { publicacionService } from "../../../services/publicacionService";
import { useToast } from "../../../hooks/useToast";
import type { Publicacion, PublicacionModeracionFilters } from "../../../types/publicacion";

export const ITEMS_PER_PAGE = 12;

type AccionModeracion = "bajar" | "reactivar" | "eliminar";

interface JustificantePendiente {
  accion: AccionModeracion;
  publicacion: Publicacion;
}

type TipoFiltro = PublicacionModeracionFilters["tipo"] | "";
type SortFiltro = NonNullable<PublicacionModeracionFilters["sort"]>;
type OrderFiltro = NonNullable<PublicacionModeracionFilters["order"]>;

export interface FiltrosModeracion {
  qDraft: string;
  setQDraft: (value: string) => void;
  tipo: TipoFiltro;
  setTipo: (value: TipoFiltro) => void;
  estado: string;
  setEstado: (value: string) => void;
  sort: SortFiltro;
  order: OrderFiltro;
  setSortOrder: (sort: SortFiltro, order: OrderFiltro) => void;
}

// Listado paginado de publicaciones para moderación, con filtros y acciones
// (bajar, reactivar, eliminar) que requieren un justificante.
export function usePublicacionesModeracion() {
  const t = useTranslations("moderacion.publicaciones");
  const toast = useToast();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoFiltro>("");
  const [estado, setEstado] = useState("");
  const [sort, setSort] = useState<SortFiltro>("fecha");
  const [order, setOrder] = useState<OrderFiltro>("desc");
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

  // Al cambiar los filtros se reinicia la carga durante el render.
  const [filtersPrevios, setFiltersPrevios] = useState(filters);
  if (filtersPrevios !== filters) {
    setFiltersPrevios(filters);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelado = false;

    publicacionService
      .getModeracion(filters)
      .then((response) => {
        if (cancelado) return;
        setPublicaciones(response.publicaciones);
        setTotal(response.total);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : t("errorCarga"));
        setPublicaciones([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filters, t]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setQ(qDraft.trim());
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [qDraft]);

  const filtros: FiltrosModeracion = {
    qDraft,
    setQDraft,
    tipo,
    setTipo: (value) => {
      setTipo(value);
      setPage(1);
    },
    estado,
    setEstado: (value) => {
      setEstado(value);
      setPage(1);
    },
    sort,
    order,
    setSortOrder: (nextSort, nextOrder) => {
      setSort(nextSort);
      setOrder(nextOrder);
      setPage(1);
    },
  };

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

  return {
    publicaciones,
    total,
    page,
    setPage,
    pageCount,
    loading,
    error,
    selected,
    setSelected,
    busyId,
    filtros,
    justificantePendiente,
    setJustificantePendiente,
    motivosReactivacion,
    tituloJustificante,
    preguntaJustificante,
    abrirJustificante,
    ejecutarAccionModeracion,
  };
}
