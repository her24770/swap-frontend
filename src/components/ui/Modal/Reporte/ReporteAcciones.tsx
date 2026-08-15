import { ChevronRight, Loader2 } from "lucide-react";

interface ReporteAccionesProps {
  puedeEnviar: boolean;
  enviando: boolean;
  onCancelar: () => void;
  textoEnviar?: string;
}

export default function ReporteAcciones({
  puedeEnviar,
  enviando,
  onCancelar,
  textoEnviar = "Enviar",
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
            {textoEnviar}
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}
