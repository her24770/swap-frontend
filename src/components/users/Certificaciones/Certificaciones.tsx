"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FileText, FileX, Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import SubirCertForm from "../../ui/Modal/SubirCertForm/SubirCertForm";
import type { Certificacion } from "../../../types/certificacion";
import "../../ui/Modal/Modal.css";
import "./Certificaciones.css";

export type { Certificacion };

interface CertificacionesProps {
  certificaciones: Certificacion[];
  canEdit?: boolean;
}

export default function Certificaciones({
  certificaciones,
  canEdit = false,
}: CertificacionesProps) {
  const t = useTranslations("profileHeader.certification");

  const [selectedId, setSelectedId] = useState<number | null>(
    certificaciones[0]?.id ?? null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  const selected = certificaciones.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!certModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCertModalOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [certModalOpen]);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  return (
    <>
      <div className="certificaciones">
        <div className="certificaciones__header">
          <h2 className="certificaciones__title">{t("title")}</h2>
          {canEdit && (
            <button
              type="button"
              className="certificaciones__btn-add"
              onClick={() => setCertModalOpen(true)}
            >
              <Plus size={15} strokeWidth={2.5} />
              {t("add")}
            </button>
          )}
        </div>

        <div className="certificaciones__body">
          <div className="certificaciones__list">
            {certificaciones.length === 0 && (
              <p className="certificaciones__empty-list">{t("noCert")}</p>
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
                      <span>{t("pdfNotA")}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="certificaciones__viewer-body">
                <div className="certificaciones__viewer-empty">
                  <FileText size={32} strokeWidth={1.2} />
                  <span>{t("select")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {canEdit && certModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCertModalOpen(false)}
          role="presentation"
        >
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Agregar certificación"
          >
            <div className="perfil-page__crear-pub-modal-content">
              <SubirCertForm
                mode="crear"
                onCancel={() => setCertModalOpen(false)}
                onSuccess={() => setCertModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
