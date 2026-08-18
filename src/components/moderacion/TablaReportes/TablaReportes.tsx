"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import Image from "next/image";
import { useToast } from "../../../hooks/useToast";
import type { ReporteDetalle, ReporteTableData } from "../../../types/reporte";
import type { PublicacionDetalle } from "../../../types/publicacion";
import DetalleReporteModal from "../../ui/Modal/DetalleReporteModal/DetalleReporteModal";
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


const ESTADO_CLASS: Record<string, string> = {
  pendiente:  "tabla-reportes__estado--pendiente",
  completado: "tabla-reportes__estado--completado",
  cancelado:  "tabla-reportes__estado--cancelado",
};

const TIPO_OPTIONS = [
  { value: "Publicación", label: "Publicación", mod: "pub" },
  { value: "Mensaje",     label: "Mensaje",     mod: "msg" },
  { value: "Usuario",     label: "Usuario",     mod: "usr" },
];

const ESTADO_OPTIONS = [
  { value: "pendiente",  label: "Pendiente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getTipoMod(tipo: ReporteTableData["tipo"]): string {
  if (tipo === "Publicación") return "pub";
  if (tipo === "Mensaje") return "msg";
  return "usr";
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
  const [search, setSearch] = useState("");
  const [detalleReporte, setDetalleReporte] = useState<ReporteDetalle | null>(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState<number | null>(null);
  const [openFilter, setOpenFilter] = useState<"tipo" | "estado" | null>(null);

  const tipoFilterRef = useRef<HTMLDivElement>(null);
  const estadoFilterRef = useRef<HTMLDivElement>(null);

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

    return reportes.filter((r) =>
      !q ||
      r.emisor.nombre.toLowerCase().includes(q) ||
      r.receptor.nombre.toLowerCase().includes(q) ||
      String(r.id_reporte).includes(q)
    );
  }, [reportes, search]);

  const handleSearch = (v: string) => { setSearch(v); setSearch(v); };

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
      toast.error(error?.message ?? "No fue posible cargar el detalle del reporte.", "Error");
    } finally {
      setCargandoDetalleId(null);
    }
  };

  return (
    <>
      <div className="tabla-reportes">
        <div className="tabla-reportes__top">
          <h1 className="tabla-reportes__title">Reportes</h1>
          <div className="tabla-reportes__search">
            <Search size={14} className="tabla-reportes__search-icon" />
            <input
              type="text"
              placeholder="Buscar"
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
                <th>ID Reporte</th>
                <th>
                  <div className="tabla-reportes__filter-wrap" ref={tipoFilterRef}>
                    <button
                      type="button"
                      className={`tabla-reportes__th-filter${tipoFilter ? " tabla-reportes__th-filter--active" : ""}`}
                      onClick={() => setOpenFilter(openFilter === "tipo" ? null : "tipo")}
                    >
                      Tipo <SlidersHorizontal size={11} />
                    </button>
                    {openFilter === "tipo" && (
                      <div className="tabla-reportes__filter-menu">
                        <button
                          type="button"
                          className={`tabla-reportes__filter-option${!tipoFilter ? " tabla-reportes__filter-option--active" : ""}`}
                          onClick={() => handleTipoFilter(null)}
                        >
                          Todos {!tipoFilter && <Check size={12} />}
                        </button>
                        {TIPO_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`tabla-reportes__filter-option${tipoFilter === opt.value ? " tabla-reportes__filter-option--active" : ""}`}
                            onClick={() => handleTipoFilter(opt.value)}
                          >
                            {opt.label} {tipoFilter === opt.value && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>Fecha</th>
                <th>
                  <div className="tabla-reportes__filter-wrap" ref={estadoFilterRef}>
                    <button
                      type="button"
                      className={`tabla-reportes__th-filter${estadoFilter ? " tabla-reportes__th-filter--active" : ""}`}
                      onClick={() => setOpenFilter(openFilter === "estado" ? null : "estado")}
                    >
                      Estado <SlidersHorizontal size={11} />
                    </button>
                    {openFilter === "estado" && (
                      <div className="tabla-reportes__filter-menu">
                        <button
                          type="button"
                          className={`tabla-reportes__filter-option${!estadoFilter ? " tabla-reportes__filter-option--active" : ""}`}
                          onClick={() => handleEstadoFilter(null)}
                        >
                          Todos {!estadoFilter && <Check size={12} />}
                        </button>
                        {ESTADO_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`tabla-reportes__filter-option${estadoFilter === opt.value ? " tabla-reportes__filter-option--active" : ""}`}
                            onClick={() => handleEstadoFilter(opt.value)}
                          >
                            {opt.label} {estadoFilter === opt.value && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>Reportó</th>
                <th>Reportado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const estadoKey = r.estado.toLowerCase();
                return (
                  <tr key={r.id_reporte}>
                    <td className="tabla-reportes__id">#{String(r.id_reporte).padStart(6, "0")}</td>
                    <td>
                      <span className={`tabla-reportes__badge tabla-reportes__badge--${getTipoMod(r.tipo)}`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="tabla-reportes__fecha">
                      {new Date(r.fecha).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <span className={`tabla-reportes__estado ${ESTADO_CLASS[estadoKey] ?? ""}`}>
                        {r.estado}
                      </span>
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
                        {cargandoDetalleId === r.id_reporte ? "Cargando…" : "Ver detalles"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="tabla-reportes__empty">
                    No se encontraron reportes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tabla-reportes__foot">
          <span className="tabla-reportes__foot-label">
            {total === 0
              ? "0 de 0"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}
          </span>

          <Paginacion
            page={page}
            total={totalPages}
            onChange={onPageChange}
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

function UsuarioCell({ nombre, email, foto }: {
  nombre: string; email: string; foto?: string;
}) {
  return (
    <div className="tabla-reportes__user-cell">
      <div className="tabla-reportes__avatar">
        {foto
          ? <Image src={foto} alt={nombre} fill style={{ objectFit: "cover" }} unoptimized />
          : <span>{initials(nombre)}</span>
        }
      </div>
      <div className="tabla-reportes__user-info">
        <span className="tabla-reportes__user-name">{nombre}</span>
        <span className="tabla-reportes__user-email">{email}</span>
      </div>
    </div>
  );
}

function Paginacion({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
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
        aria-label="Anterior"
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
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  );
}
