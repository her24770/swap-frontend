"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { ReporteDetalle, ReporteTableData } from "../../../types/reporte";
import type { PublicacionDetalle } from "../../../types/publicacion";
import DetalleReporteModal from "../../ui/Modal/DetalleReporteModal/DetalleReporteModal";
import FiltroColumna from "./FiltroColumna";
import FilaReporte from "./FilaReporte";
import Paginacion from "./Paginacion";
import { useAccionesReportes } from "./useAccionesReportes";
import "./TablaReportes.css";
import "../../../components/ui/Modal/Modal.css";
import "../../ui/Button/Button.css";

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

// `value` es el valor que espera el backend en el filtro; `key` indexa la traducción.
const TIPO_OPTIONS = [
  { value: "Publicación", key: "publicacion" },
  { value: "Mensaje",     key: "mensaje" },
  { value: "Usuario",     key: "usuario" },
];

const ESTADO_OPTIONS = [
  { value: "pendiente", key: "pendiente" },
  { value: "resuelto",  key: "resuelto" },
  { value: "rechazado", key: "rechazado" },
];

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
  const t = useTranslations("moderacion.reportes");
  const [search, setSearch] = useState("");
  const {
    listaReportes,
    detalleReporte,
    cerrarDetalle,
    cargandoDetalleId,
    actualizandoEstadoId,
    handleVerDetalles,
    handleCambiarEstado,
  } = useAccionesReportes(reportes, onVerDetalles);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return listaReportes.filter((r) =>
      !q ||
      r.emisor.nombre.toLowerCase().includes(q) ||
      r.receptor.nombre.toLowerCase().includes(q) ||
      String(r.id_reporte).includes(q)
    );
  }, [listaReportes, search]);

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
              onChange={(e) => setSearch(e.target.value)}
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
                  <FiltroColumna
                    label={t("tabla.tipo")}
                    todosLabel={t("filtros.todos")}
                    options={TIPO_OPTIONS.map((opt) => ({ value: opt.value, label: t(`tipos.${opt.key}`) }))}
                    value={tipoFilter}
                    onChange={onTipoFilterChange}
                  />
                </th>
                <th>{t("tabla.fecha")}</th>
                <th>
                  <FiltroColumna
                    label={t("tabla.estado")}
                    todosLabel={t("filtros.todos")}
                    options={ESTADO_OPTIONS.map((opt) => ({ value: opt.value, label: t(`estados.${opt.key}`) }))}
                    value={estadoFilter}
                    onChange={onEstadoFilterChange}
                  />
                </th>
                <th>{t("tabla.reporto")}</th>
                <th>{t("tabla.reportado")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <FilaReporte
                  key={r.id_reporte}
                  reporte={r}
                  actualizandoEstado={actualizandoEstadoId === r.id_reporte}
                  cargandoDetalle={cargandoDetalleId === r.id_reporte}
                  onCambiarEstado={handleCambiarEstado}
                  onVerDetalles={handleVerDetalles}
                />
              ))}

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
          onClose={cerrarDetalle}
          onVerPublicacion={onVerPublicacion}
        />
      )}
    </>
  );
}
