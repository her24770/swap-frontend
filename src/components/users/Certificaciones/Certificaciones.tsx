"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FileText, FileX, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import SubirCertForm from "../../ui/Modal/SubirCertForm/SubirCertForm";
import type { Certificacion } from "../../../types/certificacion";
import { useUIStore } from "../../../store/uiStore";
import "../../ui/Modal/Modal.css";
import "./Certificaciones.css";

export type { Certificacion };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface CertificacionesProps {
  certificaciones: Certificacion[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

export default function Certificaciones({
  certificaciones,
  canEdit = false,
  onRefresh,
}: CertificacionesProps) {
  const t = useTranslations("profileHeader.certification");
  const { mostrarConfirm, agregarNotificacion } = useUIStore();

  const [selectedId, setSelectedId] = useState<number | null>(
    certificaciones[0]?.id_certificacion ?? null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  const selected = certificaciones.find((c) => c.id_certificacion === selectedId) ?? null;

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

  const handleEliminar = (id: number) => {
    mostrarConfirm({
      titulo: "Eliminar certificación",
      mensaje: "¿Estás seguro de que deseas eliminar esta certificación? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/certificacion/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message ?? `Error ${res.status}`);
          }
          if (selectedId === id) setSelectedId(null);
          agregarNotificacion({ tipo: "success", mensaje: "Certificación eliminada exitosamente." });
          onRefresh?.();
        } catch (err: any) {
          agregarNotificacion({ tipo: "error", mensaje: err.message || "No fue posible eliminar la certificación." });
        }
      },
    });
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
              <div
                key={cert.id_certificacion}
                className={`certificaciones__item${selectedId === cert.id_certificacion ? " certificaciones__item--active" : ""}`}
              >
                <button
                  type="button"
                  className="certificaciones__item-btn"
                  onClick={() => setSelectedId(cert.id_certificacion)}
                >
                  <FileText size={16} className="certificaciones__item-icon" />
                  <div className="certificaciones__item-info">
                    <span className="certificaciones__item-name">{cert.nombre}</span>
                    <span className="certificaciones__item-year">{cert.lugar_emision}</span>
                  </div>
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="certificaciones__item-delete"
                    onClick={() => handleEliminar(cert.id_certificacion)}
                    title={t("delete")}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
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
                    <span className="certificaciones__viewer-year">{selected.lugar_emision}</span>
                  </div>

                  {selected.ruta_pdf && (
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
                  {selected.ruta_pdf ? (
                    <iframe
                      src={selected.ruta_pdf}
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
                onSuccess={() => {
                  setCertModalOpen(false);
                  onRefresh?.();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
