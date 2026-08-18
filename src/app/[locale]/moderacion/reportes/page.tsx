"use client";

import { useEffect, useState } from "react";
import TablaReportes from "../../../../components/moderacion/TablaReportes/TablaReportes";
import type { ReporteTableData } from "../../../../types/reporte";
import { publicacionService } from "../../../../services/publicacionService";
import { reporteService } from "../../../../services/reporteService";
import "./ReportesPage.css";


export default function ModeracionReportesPage() {
  const [reportes, setReportes] = useState<ReporteTableData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);

  const pageSize = 10;

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const resultado = await reporteService.obtenerReportes({
          page,
          limit: pageSize,
          sort: "fecha",
          order: "desc",
          tipo:
            tipoFilter === "Publicación"
              ? "publicacion"
              : tipoFilter === "Mensaje"
                ? "mensaje"
                : "todos",
          estado: estadoFilter === "Pendiente"
            ? "pendiente"
            : estadoFilter === "Resuelto"
              ? "resuelto"
              : estadoFilter === "Rechazado"
                ? "rechazado"
                : "todos",
        });

        setReportes(resultado.reportes);
        setTotal(resultado.total);
        setTotalPages(resultado.totalPages);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      }
    };

    cargarReportes();
  }, [page, tipoFilter, estadoFilter]);

  
  return (
    <div className="moderacion-reportes-page">
      <TablaReportes
        reportes={reportes}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        tipoFilter={tipoFilter}
        estadoFilter={estadoFilter}
        onPageChange={setPage}
        onTipoFilterChange={(tipo) => {
          setTipoFilter(tipo);
          setPage(1);
        }}
        onEstadoFilterChange={(estado) => {
          setEstadoFilter(estado);
          setPage(1);
        }}
        onVerDetalles={reporteService.obtenerReportePorId}
        onVerPublicacion={publicacionService.getById}
      />
    </div>
  );
}
