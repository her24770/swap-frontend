import { ChevronRight, Loader2 } from "lucide-react";

interface ReporteAccionesProps {
  puedeEnviar: boolean;
  enviando: boolean;
  onCancelar: () => void;
}

export default function ReporteAcciones({
  puedeEnviar,
  enviando,
  onCancelar,
}: ReporteAccionesProps) {
  return (
    <div className="reporte-modal__acciones">
      <button type="button" className="reporte-modal__btn reporte-modal__btn--ghost" onClick={onCancelar}>
        Cancelar
      </button>
      <button
        type="submit"
        className="reporte-modal__btn reporte-modal__btn--primary"
        disabled={!puedeEnviar || enviando}
      >
        {enviando ? (
          <Loader2 size={14} className="reporte-modal__spinner" />
        ) : (
          <>
            Enviar
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}
