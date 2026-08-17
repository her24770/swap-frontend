"use client";

import TablaReportes from "../../../../components/moderacion/TablaReportes/TablaReportes";
import type { ReporteTableData } from "../../../../types/reporte";
import "./ReportesPage.css";

const MOCK_REPORTES = [
  {
    id_reporte: 1042,
    tipo: "Publicación",
    fecha: "2026-08-10T14:30:00.000Z",
    estado: "pendiente",
    emisor: {
      nombre: "Sofía Morales",
      email_institucional: "sofia@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Diego Herrera",
      email_institucional: "diego.herrera@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
  {
    id_reporte: 1041,
    tipo: "Mensaje",
    fecha: "2026-08-09T09:15:00.000Z",
    estado: "completado",
    emisor: {
      nombre: "Andrea Lopez",
      email_institucional: "andrea.lopez@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Carlos Reyes",
      email_institucional: "carlos.reyes@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
  {
    id_reporte: 1040,
    tipo: "Publicación",
    fecha: "2026-08-07T18:45:00.000Z",
    estado: "cancelado",
    emisor: {
      nombre: "Marcos Núñez",
      email_institucional: "marcos.nunez@uvg.edu.gt",
      url_foto_perfil: "",
    },
    receptor: {
      nombre: "Valeria Cruz",
      email_institucional: "valeria.cruz@uvg.edu.gt",
      url_foto_perfil: "",
    },
  },
] satisfies ReporteTableData[];

export default function ModeracionReportesPage() {
  return (
    <div className="moderacion-reportes-page">
      <TablaReportes
        reportes={MOCK_REPORTES}
        total={MOCK_REPORTES.length}
        pageSize={10}
      />
    </div>
  );
}
