import type { MotivoReporte } from "../../../../types/reporte";
import ReporteMotivoOption from "./ReporteMotivoOption";

interface ReporteMotivosProps {
  motivos: MotivoReporte[];
  motivoSeleccionado: MotivoReporte | null;
  onSeleccionarMotivo: (motivo: MotivoReporte) => void;
}

export default function ReporteMotivos({
  motivos,
  motivoSeleccionado,
  onSeleccionarMotivo,
}: ReporteMotivosProps) {
  return (
    <div className="reporte-modal__motivos">
      {motivos.map((motivo) => (
        <ReporteMotivoOption
          key={motivo}
          motivo={motivo}
          seleccionado={motivoSeleccionado === motivo}
          onSeleccionar={onSeleccionarMotivo}
        />
      ))}
    </div>
  );
}
