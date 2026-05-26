"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FileText, FileX, Maximize2, Minimize2 } from "lucide-react";
import "./Certificaciones.css";

export interface Certificacion {
  id: number;
  nombre: string;
  anio: number;
  url_pdf: string;
}

interface CertificacionesProps {
  certificaciones: Certificacion[];
  canEdit?: boolean;
  onAgregar?: () => void;
}

export default function Certificaciones({
  certificaciones,
  canEdit = false,
  onAgregar,
}: CertificacionesProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    certificaciones[0]?.id ?? null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  const selected = certificaciones.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error intentando activar/desactivar pantalla completa:", err);
    }
  };

  return (
    <div className="certificaciones">
      {/* ── Header General ── */}
      <div className="certificaciones__header">
        <h2 className="certificaciones__title">Certificaciones</h2>
        {canEdit && (
          <button
            type="button"
            className="certificaciones__btn-add"
            onClick={onAgregar}
          >
            <Plus size={15} strokeWidth={2.5} />
            Agregar certificación
          </button>
        )}
      </div>

      <div className="certificaciones__body">
        {/* Lista */}
        <div className="certificaciones__list">
          {certificaciones.length === 0 && (
            <p className="certificaciones__empty-list">
              No hay certificaciones aún.
            </p>
          )}
          {certificaciones.map((cert) => (
            <button
              key={cert.id}
              type="button"
              className={`certificaciones__item${selectedId === cert.id ? " certificaciones__item--active" : ""}`}
              onClick={() => setSelectedId(cert.id)}
            >
              <FileText size={16} className="certificaciones__item-icon" />
              <div className="certificaciones__item-info">
                <span className="certificaciones__item-name">{cert.nombre}</span>
                <span className="certificaciones__item-year">{cert.anio}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Visor */}
        <div 
          ref={viewerRef} 
          className={`certificaciones__viewer${isFullscreen ? " certificaciones__viewer--fullscreen" : ""}`}
        >
          {selected ? (
            <>
              <div className="certificaciones__viewer-header">
                <div className="certificaciones__viewer-titles">
                  <span className="certificaciones__viewer-name">{selected.nombre}</span>
                  <span className="certificaciones__viewer-year">{selected.anio}</span>
                </div>
                
                {selected.url_pdf && (
                  <button
                    type="button"
                    className="certificaciones__btn-fullscreen"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                )}
              </div>
              
              <div className="certificaciones__viewer-body">
                {selected.url_pdf ? (
                  <iframe
                    src={selected.url_pdf}
                    title={selected.nombre}
                    className="certificaciones__iframe"
                  />
                ) : (
                  <div className="certificaciones__viewer-empty">
                    <FileX size={32} strokeWidth={1.2} />
                    <span>PDF no disponible</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="certificaciones__viewer-body">
              <div className="certificaciones__viewer-empty">
                <FileText size={32} strokeWidth={1.2} />
                <span>Selecciona una certificación para verla</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}