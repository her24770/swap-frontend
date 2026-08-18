"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CloudUpload, X } from "lucide-react";
import { useReporte } from "../../../../hooks/useReporte";
import {
  motivosReportePorObjetivo,
  MotivoReporte,
  TipoObjetivoReporte,
} from "../../../../types/reporte";
import "../Modal.css";
import "./ReporteModal.css";
import ReporteAcciones from "./ReporteAcciones";
import ReporteDetalle from "./ReporteDetalle";
import ReporteMotivos from "./ReporteMotivos";

const LIMITE_DETALLE_REPORTE = 500;
const MAX_EVIDENCIAS = 3;
const MAX_TAMANO_IMAGEN = 5 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

const preguntasPorObjetivo: Record<TipoObjetivoReporte, string> = {
  usuario: "¿Por qué quieres reportar al usuario?",
  comentario: "¿Por qué quieres reportar el comentario?",
  publicacion: "¿Por qué quieres reportar la publicación?",
};

interface ReporteModalProps {
  isOpen: boolean;
  tipoObjetivo: TipoObjetivoReporte;
  idObjetivo: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReporteModal({
  isOpen,
  tipoObjetivo,
  idObjetivo,
  onClose,
  onSuccess,
}: ReporteModalProps) {
  const { crearReporte, enviandoReporte } = useReporte();
  const motivos = useMemo(() => motivosReportePorObjetivo[tipoObjetivo], [tipoObjetivo]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<MotivoReporte | null>(null);
  const [detalle, setDetalle] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorEvidencias, setErrorEvidencias] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const permiteEvidencias = tipoObjetivo === "usuario";

  useEffect(() => {
    if (isOpen) {
      setMotivoSeleccionado(null);
      setDetalle("");
      setEvidencias([]);
      setErrorEvidencias(null);
    }
  }, [isOpen, tipoObjetivo, idObjetivo]);

  useEffect(() => {
    const urls = evidencias.map((archivo) => URL.createObjectURL(archivo));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [evidencias]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!motivoSeleccionado || enviandoReporte) return;

    const reporte = await crearReporte({
      tipo_objetivo: tipoObjetivo,
      id_objetivo: idObjetivo,
      motivo: motivoSeleccionado,
      detalle,
      imagenes: permiteEvidencias ? evidencias : undefined,
    });

    if (reporte) {
      onSuccess?.();
      onClose();
    }
  };

  const agregarEvidencias = (archivos: FileList | File[]) => {
    const archivosSeleccionados = Array.from(archivos);
    if (archivosSeleccionados.length === 0) return;

    const espacioDisponible = MAX_EVIDENCIAS - evidencias.length;
    if (espacioDisponible <= 0) {
      setErrorEvidencias(`Solo puedes adjuntar hasta ${MAX_EVIDENCIAS} imágenes.`);
      return;
    }

    const validas: File[] = [];
    for (const archivo of archivosSeleccionados) {
      if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
        setErrorEvidencias("Solo se permiten imágenes JPG, PNG o WEBP.");
        return;
      }

      if (archivo.size > MAX_TAMANO_IMAGEN) {
        setErrorEvidencias("Cada imagen debe pesar 5MB o menos.");
        return;
      }

      validas.push(archivo);
    }

    const porAgregar = validas.slice(0, espacioDisponible);
    setEvidencias((actuales) => [...actuales, ...porAgregar]);
    setErrorEvidencias(
      validas.length > espacioDisponible
        ? `Solo se agregaron ${espacioDisponible} imágenes. El máximo es ${MAX_EVIDENCIAS}.`
        : null
    );
  };

  const handleInputEvidencias = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) agregarEvidencias(event.target.files);
    event.currentTarget.value = "";
  };

  const handleDropEvidencias = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    agregarEvidencias(event.dataTransfer.files);
  };

  const quitarEvidencia = (index: number) => {
    setEvidencias((actuales) => actuales.filter((_, i) => i !== index));
    setErrorEvidencias(null);
  };

  const modal = (
    <div className="modal-overlay reporte-modal__overlay" onClick={onClose}>
      <form className="reporte-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="reporte-modal__header">
          <h2 className="reporte-modal__title">Reporte</h2>
          <button type="button" className="reporte-modal__close" onClick={onClose} aria-label="Cerrar reporte">
            <X size={18} />
          </button>
        </div>

        <div className="reporte-modal__body">
          <section className="reporte-modal__section">
            <h3 className="reporte-modal__question">{preguntasPorObjetivo[tipoObjetivo]}</h3>
            <ReporteMotivos<MotivoReporte>
              motivos={motivos}
              motivoSeleccionado={motivoSeleccionado}
              onSeleccionarMotivo={setMotivoSeleccionado}
            />
          </section>

          <ReporteDetalle
            valor={detalle}
            limiteCaracteres={LIMITE_DETALLE_REPORTE}
            onCambiar={setDetalle}
          />

          {permiteEvidencias && (
            <section className="reporte-modal__section">
              <h3 className="reporte-modal__section-title">Evidencia opcional</h3>
              <div
                className={`reporte-modal__upload-zone${dragOver ? " reporte-modal__upload-zone--dragover" : ""}${evidencias.length >= MAX_EVIDENCIAS ? " reporte-modal__upload-zone--disabled" : ""}`}
                onClick={() => {
                  if (evidencias.length < MAX_EVIDENCIAS) {
                    document.getElementById("reporte-evidencias-input")?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDropEvidencias}
              >
                <CloudUpload size={32} strokeWidth={1.5} className="reporte-modal__upload-icon" />
                <p className="reporte-modal__upload-text">
                  Adjunta hasta {MAX_EVIDENCIAS} imágenes como evidencia
                </p>
                <p className="reporte-modal__upload-hint">JPG, PNG o WEBP. Máximo 5MB por imagen.</p>
                <input
                  id="reporte-evidencias-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="reporte-modal__upload-input"
                  onChange={handleInputEvidencias}
                  disabled={evidencias.length >= MAX_EVIDENCIAS || enviandoReporte}
                />
              </div>

              {errorEvidencias && <p className="reporte-modal__upload-error">{errorEvidencias}</p>}

              {previewUrls.length > 0 && (
                <div className="reporte-modal__previews">
                  {previewUrls.map((src, index) => (
                    <div key={`${src}-${index}`} className="reporte-modal__preview-item">
                      <img src={src} alt={`Evidencia ${index + 1}`} className="reporte-modal__preview-img" />
                      <button
                        type="button"
                        className="reporte-modal__preview-remove"
                        onClick={() => quitarEvidencia(index)}
                        aria-label={`Quitar evidencia ${index + 1}`}
                        disabled={enviandoReporte}
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <ReporteAcciones
            puedeEnviar={Boolean(motivoSeleccionado)}
            enviando={enviandoReporte}
            onCancelar={onClose}
          />
        </div>
      </form>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
}
