import ReporteMotivoOption from "./ReporteMotivoOption";

interface ReporteMotivosProps<TMotivo extends string> {
  motivos: TMotivo[];
  motivoSeleccionado: TMotivo | null;
  onSeleccionarMotivo: (motivo: TMotivo) => void;
}

export default function ReporteMotivos<TMotivo extends string>({
  motivos,
  motivoSeleccionado,
  onSeleccionarMotivo,
}: ReporteMotivosProps<TMotivo>) {
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
