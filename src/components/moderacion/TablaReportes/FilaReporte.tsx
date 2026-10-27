import { useLocale, useTranslations } from "next-intl";
import type { ReporteTableData } from "../../../types/reporte";
import UsuarioCell from "./UsuarioCell";
import "../../ui/Button/Button.css";

const ESTADO_CLASS: Record<string, string> = {
  pendiente: "tabla-reportes__estado--pendiente",
  resuelto:  "tabla-reportes__estado--resuelto",
  rechazado: "tabla-reportes__estado--rechazado",
};

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

interface FilaReporteProps {
  reporte: ReporteTableData;
  actualizandoEstado: boolean;
  cargandoDetalle: boolean;
  onCambiarEstado: (idReporte: number, nuevoEstado: string) => void;
  onVerDetalles: (idReporte: number) => void;
}

export default function FilaReporte({
  reporte: r,
  actualizandoEstado,
  cargandoDetalle,
  onCambiarEstado,
  onVerDetalles,
}: FilaReporteProps) {
  const t = useTranslations("moderacion.reportes");
  const locale = useLocale();
  const estadoKey = r.estado.toLowerCase();

  return (
    <tr>
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
          disabled={actualizandoEstado}
          onChange={(e) => onCambiarEstado(r.id_reporte, e.target.value)}
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
          onClick={() => onVerDetalles(r.id_reporte)}
          disabled={cargandoDetalle}
        >
          {cargandoDetalle ? t("acciones.cargando") : t("acciones.verDetalles")}
        </button>
      </td>
    </tr>
  );
}
