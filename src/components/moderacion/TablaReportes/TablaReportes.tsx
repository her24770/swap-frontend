"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import Image from "next/image";
import { useToast } from "../../../hooks/useToast";
import type { ReporteDetalle, ReporteTableData } from "../../../types/reporte";
import type { PublicacionDetalle } from "../../../types/publicacion";
import DetalleReporteModal from "../../ui/Modal/DetalleReporteModal/DetalleReporteModal";
import "./TablaReportes.css";
import "../../../components/ui/Modal/Modal.css";
import "../../ui/Button/Button.css";
import { reporteService } from "../../../services/reporteService";

interface TablaReportesProps {
  reportes: ReporteTableData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tipoFilter: string | null;
  estadoFilter: string | null;
  onPageChange: (page: number) => void;
  onTipoFilterChange: (tipo: string | null) => void;
  onEstadoFilterChange: (estado: string | null) => void;
  onVerDetalles: (id: number) => Promise<ReporteDetalle> | ReporteDetalle;
  onVerPublicacion: (id: number) => Promise<PublicacionDetalle> | PublicacionDetalle;
}

const ESTADO_CLASS: Record<string, string> = {
  pendiente: "tabla-reportes__estado--pendiente",
  resuelto:  "tabla-reportes__estado--resuelto",
  rechazado: "tabla-reportes__estado--rechazado",
};

// `value` es el valor que espera el backend en el filtro; `key` indexa la traducción.
const TIPO_OPTIONS = [
  { value: "Publicación", key: "publicacion", mod: "pub" },
  { value: "Mensaje",     key: "mensaje",     mod: "msg" },
  { value: "Usuario",     key: "usuario",     mod: "usr" },
];

const ESTADO_OPTIONS = [
  { value: "pendiente", key: "pendiente" },
  { value: "resuelto",  key: "resuelto" },
  { value: "rechazado", key: "rechazado" },
];

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getTipoMod(tipo: ReporteTableData["tipo"]): string {
  if (tipo === "Publicación") return "pub";
  if (tipo === "Mensaje") return "msg";
  return "usr";
}

function getTipoKey(tipo: ReporteTableData["tipo"]): string {
  if (tipo === "Publicación") return "publicacion";
  if (tipo === "Mensaje") return "mensaje";
  return "usuario";
}

export default function TablaReportes({
  reportes,
  total,
  page,
  pageSize,
  totalPages,
  tipoFilter,
  estadoFilter,
  onPageChange,
  onTipoFilterChange,
  onEstadoFilterChange,
  onVerDetalles,
  onVerPublicacion,
}: TablaReportesProps) {
  const toast = useToast();
  const t = useTranslations("moderacion.reportes");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [listaReportes, setListaReportes] = useState<ReporteTableData[]>(reportes);
  const [detalleReporte, setDetalleReporte] = useState<ReporteDetalle | null>(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState<number | null>(null);
  const [actualizandoEstadoId, setActualizandoEstadoId] = useState<number | null>(null);
  const [openFilter, setOpenFilter] = useState<"tipo" | "estado" | null>(null);
  
  const tipoFilterRef = useRef<HTMLDivElement>(null);
  const estadoFilterRef = useRef<HTMLDivElement>(null);

  // Sincronizar estado local cuando las props cambian
  useEffect(() => {
    setListaReportes(reportes);
  }, [reportes]);

  // Manejador para cerrar menús desplegables al hacer clic fuera
  useEffect(() => {
    if (!openFilter) return;
    const ref = openFilter === "tipo" ? tipoFilterRef : estadoFilterRef;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return listaReportes.filter((r) =>
      !q ||
      r.emisor.nombre.toLowerCase().includes(q) ||
      r.receptor.nombre.toLowerCase().includes(q) ||
      String(r.id_reporte).includes(q)
    );
  }, [listaReportes, search]);

  const handleSearch = (v: string) => setSearch(v);

  const handleTipoFilter = (v: string | null) => {
    onTipoFilterChange(v);
    setOpenFilter(null);
  };

  const handleEstadoFilter = (v: string | null) => {
    onEstadoFilterChange(v);
    setOpenFilter(null);
  };

  const handleVerDetalles = async (id: number) => {
    if (cargandoDetalleId) return;
    setCargandoDetalleId(id);
    try {
      const detalle = await onVerDetalles(id);
      setDetalleReporte(detalle);
    } catch (error: any) {
      toast.error(error?.message ?? t("toasts.detalleError"), t("errorGenerico"));
    } finally {
      setCargandoDetalleId(null);
    }
  };

  // Función principal para cambiar el estado del reporte
  const handleCambiarEstado = async (id_reporte: number, nuevoEstado: string) => {
    const reporteActual = listaReportes.find((r) => r.id_reporte === id_reporte);
    const estadoAnterior = reporteActual?.estado;

    if (!estadoAnterior || estadoAnterior.toLowerCase() === nuevoEstado.toLowerCase()) {
      return;
    }

    setActualizandoEstadoId(id_reporte);

    setListaReportes((prev) =>
      prev.map((r) =>
        r.id_reporte === id_reporte ? { ...r, estado: nuevoEstado } : r
      )
    );

    try {
      await reporteService.actualizarEstadoReporte(id_reporte, nuevoEstado);
      toast.success(t("toasts.estadoActualizado"));
    } catch (error: any) {
      setListaReportes((prev) =>
        prev.map((r) =>
          r.id_reporte === id_reporte ? { ...r, estado: estadoAnterior } : r
        )
      );
      toast.error(error?.message ?? t("toasts.estadoError"), t("errorGenerico"));
    } finally {
      setActualizandoEstadoId(null);
    }
  };

  return (
    <>
      <div className="tabla-reportes">
        <div className="tabla-reportes__top">
          <h1 className="tabla-reportes__title">{t("title")}</h1>
          <div className="tabla-reportes__search">
            <Search size={14} className="tabla-reportes__search-icon" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="tabla-reportes__search-input"
            />
          </div>
        </div>

        <div className="tabla-reportes__scroll">
          <table className="tabla-reportes__table">
            <thead>
              <tr>
                <th>{t("tabla.id")}</th>
                <th>
                  <div className="tabla-reportes__filter-wrap" ref={tipoFilterRef}>
                    <button
                      type="button"
                      className={`tabla-reportes__th-filter${tipoFilter ? " tabla-reportes__th-filter--active" : ""}`}
                      onClick={() => setOpenFilter(openFilter === "tipo" ? null : "tipo")}
                    >
                      {t("tabla.tipo")} <SlidersHorizontal size={11} />
                    </button>
                    {openFilter === "tipo" && (
                      <div className="tabla-reportes__filter-menu">
                        <button
                          type="button"
                          className={`tabla-reportes__filter-option${!tipoFilter ? " tabla-reportes__filter-option--active" : ""}`}
                          onClick={() => handleTipoFilter(null)}
                        >
                          {t("filtros.todos")} {!tipoFilter && <Check size={12} />}
                        </button>
                        {TIPO_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`tabla-reportes__filter-option${tipoFilter === opt.value ? " tabla-reportes__filter-option--active" : ""}`}
                            onClick={() => handleTipoFilter(opt.value)}
                          >
                            {t(`tipos.${opt.key}`)} {tipoFilter === opt.value && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>{t("tabla.fecha")}</th>
                <th>
                  <div className="tabla-reportes__filter-wrap" ref={estadoFilterRef}>
                    <button
                      type="button"
                      className={`tabla-reportes__th-filter${estadoFilter ? " tabla-reportes__th-filter--active" : ""}`}
                      onClick={() => setOpenFilter(openFilter === "estado" ? null : "estado")}
                    >
                      {t("tabla.estado")} <SlidersHorizontal size={11} />
                    </button>
                    {openFilter === "estado" && (
                      <div className="tabla-reportes__filter-menu">
                        <button
                          type="button"
                          className={`tabla-reportes__filter-option${!estadoFilter ? " tabla-reportes__filter-option--active" : ""}`}
                          onClick={() => handleEstadoFilter(null)}
                        >
                          {t("filtros.todos")} {!estadoFilter && <Check size={12} />}
                        </button>
                        {ESTADO_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`tabla-reportes__filter-option${estadoFilter === opt.value ? " tabla-reportes__filter-option--active" : ""}`}
                            onClick={() => handleEstadoFilter(opt.value)}
                          >
                            {t(`estados.${opt.key}`)} {estadoFilter === opt.value && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>{t("tabla.reporto")}</th>
                <th>{t("tabla.reportado")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const estadoKey = r.estado.toLowerCase();
                const estaActualizando = actualizandoEstadoId === r.id_reporte;

                return (
                  <tr key={r.id_reporte}>
                    <td className="tabla-reportes__id">
                      #{String(r.id_reporte).padStart(6, "0")}
                    </td>
                    <td>
                      <span className={`tabla-reportes__badge tabla-reportes__badge--${getTipoMod(r.tipo)}`}>
                        {t(`tipos.${getTipoKey(r.tipo)}`)}
                      </span>
                    </td>
                    <td className="tabla-reportes__fecha">
                      {new Date(r.fecha).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <select
                        value={estadoKey}
                        className={`tabla-reportes__estado ${ESTADO_CLASS[estadoKey] ?? ""}`}
                        disabled={estaActualizando}
                        onChange={(e) => handleCambiarEstado(r.id_reporte, e.target.value)}
                      >
                        <option value="pendiente">{t("estados.pendiente")}</option>
                        <option value="resuelto">{t("estados.resuelto")}</option>
                        <option value="rechazado">{t("estados.rechazado")}</option>
                      </select>
                    </td>
                    <td>
                      <UsuarioCell
                        nombre={r.emisor.nombre}
                        email={r.emisor.email_institucional}
                        foto={r.emisor.url_foto_perfil}
                      />
                    </td>
                    <td>
                      <UsuarioCell
                        nombre={r.receptor.nombre}
                        email={r.receptor.email_institucional}
                        foto={r.receptor.url_foto_perfil}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button--small button--outline"
                        onClick={() => handleVerDetalles(r.id_reporte)}
                        disabled={cargandoDetalleId === r.id_reporte}
                      >
                        {cargandoDetalleId === r.id_reporte ? t("acciones.cargando") : t("acciones.verDetalles")}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="tabla-reportes__empty">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tabla-reportes__foot">
          <span className="tabla-reportes__foot-label">
            {total === 0
              ? t("footEmpty")
              : t("footRange", {
                  from: (page - 1) * pageSize + 1,
                  to: Math.min(page * pageSize, total),
                  total,
                })}
          </span>

          <Paginacion
            page={page}
            total={totalPages}
            onChange={onPageChange}
            labelAnterior={t("paginacion.anterior")}
            labelSiguiente={t("paginacion.siguiente")}
          />
        </div>
      </div>

      {detalleReporte && (
        <DetalleReporteModal
          reporte={detalleReporte}
          onClose={() => setDetalleReporte(null)}
          onVerPublicacion={onVerPublicacion}
        />
      )}
    </>
  );
}

function UsuarioCell({
  nombre,
  email,
  foto,
}: {
  nombre: string;
  email: string;
  foto?: string;
}) {
  return (
    <div className="tabla-reportes__user-cell">
      <div className="tabla-reportes__avatar">
        {foto ? (
          <Image src={foto} alt={nombre} fill style={{ objectFit: "cover" }} unoptimized />
        ) : (
          <span>{initials(nombre)}</span>
        )}
      </div>
      <div className="tabla-reportes__user-info">
        <span className="tabla-reportes__user-name">{nombre}</span>
        <span className="tabla-reportes__user-email">{email}</span>
      </div>
    </div>
  );
}

function Paginacion({
  page,
  total,
  onChange,
  labelAnterior,
  labelSiguiente,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  labelAnterior: string;
  labelSiguiente: string;
}) {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - page) <= 1) pages.push(i);
    else if (Math.abs(i - page) === 2 && !pages.includes("...")) pages.push("...");
  }
  return (
    <div className="tabla-reportes__pages">
      <button
        type="button"
        className="tabla-reportes__page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={labelAnterior}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="tabla-reportes__dots">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`tabla-reportes__page-btn${page === p ? " tabla-reportes__page-btn--active" : ""}`}
            onClick={() => onChange(p as number)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="tabla-reportes__page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        aria-label={labelSiguiente}
      >
        ›
      </button>
    </div>
  );
}
