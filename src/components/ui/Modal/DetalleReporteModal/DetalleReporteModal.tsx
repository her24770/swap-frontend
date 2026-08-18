"use client";

import { useState } from "react";
import { X, UserCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../hooks/useToast";
import type { ReporteDetalle } from "../../../../types/reporte";
import type { PublicacionDetalle, PublicacionEtiquetaRel } from "../../../../types/publicacion";
import type { Tag } from "../../../../types/tag";
import CarruselImagen from "../DetallePuclicacion/CarruselImagen/CarruselImagen";
import TagBadge from "../../TagBadge/TagBadge";
import EstadoTag from "../../../posts/PostCard/EstadoTag/EstadoTag";
import "../../../ui/Modal/Modal.css";
import "../../../moderacion/TablaReportes/TablaReportes.css";
import "../DetallePuclicacion/DetallePublicacion.css";
import "./DetalleReporteModal.css";

interface DetalleReporteModalProps {
  reporte: ReporteDetalle;
  onClose: () => void;
  onMarcarResuelto?: () => void;
  onVerPublicacion: (id: number) => Promise<PublicacionDetalle> | PublicacionDetalle;
}

const MAX_STARS = 5;

function initials(n: string) {
  return n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function tagsFromEtiquetas(etiquetas: PublicacionEtiquetaRel[]): Tag[] {
  return etiquetas.map((rel) => ({
    id: rel.etiqueta.id_etiqueta,
    name: rel.etiqueta.nombre,
    parentId: rel.etiqueta.id_etiqueta_padre,
  }));
}

const ESTADO_CLASS: Record<string, string> = {
  pendiente:  "tabla-reportes__estado--pendiente",
  completado: "tabla-reportes__estado--completado",
  cancelado:  "tabla-reportes__estado--cancelado",
};

export default function DetalleReporteModal({ reporte, onClose, onMarcarResuelto, onVerPublicacion }: DetalleReporteModalProps) {
  const router = useRouter();
  const toast = useToast();
  const r = reporte;
  const tipo = r.publicacion ? "Publicación" : r.mensaje ? "Mensaje" : "Usuario";
  const estadoKey = r.estadoRel.estado.toLowerCase();
  const [publicacionAbierta, setPublicacionAbierta] = useState(false);
  const [publicacionData, setPublicacionData] = useState<PublicacionDetalle | null>(null);
  const [cargandoPublicacion, setCargandoPublicacion] = useState(false);
  const mostrarPanelPublicacion = publicacionAbierta && Boolean(r.publicacion);

  const handleTogglePublicacion = async () => {
    if (publicacionAbierta) {
      setPublicacionAbierta(false);
      return;
    }
    if (!r.publicacion) return;

    setPublicacionAbierta(true);
    if (publicacionData?.id_publicacion === r.publicacion.id_publicacion) return;

    setCargandoPublicacion(true);
    try {
      const data = await onVerPublicacion(r.publicacion.id_publicacion);
      setPublicacionData(data);
    } catch (error: any) {
      toast.error(error?.message ?? "No fue posible cargar la publicación.", "Error");
      setPublicacionAbierta(false);
    } finally {
      setCargandoPublicacion(false);
    }
  };

  const carouselImages = publicacionData?.imagenes.map((img) => img.url_imagen) ?? [];
  const tags = publicacionData ? tagsFromEtiquetas(publicacionData.etiquetas) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`detalle-reporte-modal${mostrarPanelPublicacion ? " detalle-reporte-modal--expanded" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="detalle-reporte-modal__header">
          <h2 className="detalle-reporte-modal__title">
            Reporte #{String(r.id_reporte).padStart(6, "0")}
          </h2>
          <button type="button" className="detalle-reporte-modal__close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="detalle-reporte-modal__content">
        <div className="detalle-reporte-modal__body">

          <div className="detalle-reporte-modal__grid">
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Tipo</span>
              <span className="detalle-reporte-modal__val">{tipo}</span>
            </div>
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Fecha</span>
              <span className="detalle-reporte-modal__val">
                {new Date(r.fecha).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Estado</span>
              <span className={`tabla-reportes__estado ${ESTADO_CLASS[estadoKey] ?? ""}`}>
                {r.estadoRel.estado}
              </span>
            </div>
            {r.moderador && (
              <div className="detalle-reporte-modal__field">
                <span className="detalle-reporte-modal__label">Moderador</span>
                <span className="detalle-reporte-modal__val">{r.moderador.usuario}</span>
              </div>
            )}
          </div>

          <hr className="detalle-reporte-modal__divider" />

          {/* Motivo y observaciones */}
          <div className="detalle-reporte-modal__field">
            <span className="detalle-reporte-modal__label">Motivo</span>
            <span className="detalle-reporte-modal__val">{r.motivoRel.motivo}</span>
          </div>
          <div className="detalle-reporte-modal__field">
            <span className="detalle-reporte-modal__label">Observaciones</span>
            <p className="detalle-reporte-modal__obs">{r.observaciones}</p>
          </div>

          {/* Publicación vinculada */}
          {r.publicacion && (
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Publicación vinculada</span>
              <div className="detalle-reporte-modal__publicacion-row">
                <span className="detalle-reporte-modal__val">{r.publicacion.titulo}</span>
                <button
                  type="button"
                  className="button button--small button--outline"
                  onClick={handleTogglePublicacion}
                  disabled={cargandoPublicacion}
                >
                  {cargandoPublicacion ? "Cargando…" : mostrarPanelPublicacion ? "Ocultar publicación" : "Ver publicación"}
                </button>
              </div>
            </div>
          )}

          <hr className="detalle-reporte-modal__divider" />

          {/* Usuarios */}
          <div className="detalle-reporte-modal__grid">
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Reportó</span>
              <div className="tabla-reportes__user-cell" style={{ marginTop: "0.375rem" }}>
                <div className="tabla-reportes__avatar">
                  <span>{initials(r.emisor.nombre)}</span>
                </div>
                <div className="tabla-reportes__user-info">
                  <button
                    type="button"
                    className="detalle-reporte-modal__user-name"
                    onClick={() => { router.push(`/vendedor/${r.emisor.id_usuario}`); onClose(); }}
                  >
                    {r.emisor.nombre}
                  </button>
                  <span className="tabla-reportes__user-email">{r.emisor.email_institucional}</span>
                </div>
              </div>
            </div>
            <div className="detalle-reporte-modal__field">
              <span className="detalle-reporte-modal__label">Reportado</span>
              <div className="tabla-reportes__user-cell" style={{ marginTop: "0.375rem" }}>
                <div className="tabla-reportes__avatar">
                  <span>{initials(r.receptor.nombre)}</span>
                </div>
                <div className="tabla-reportes__user-info">
                  <button
                    type="button"
                    className="detalle-reporte-modal__user-name"
                    onClick={() => { router.push(`/vendedor/${r.receptor.id_usuario}`); onClose(); }}
                  >
                    {r.receptor.nombre}
                  </button>
                  <span className="tabla-reportes__user-email">{r.receptor.email_institucional}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen de evidencia */}
          {r.link_imagen && (
            <>
              <hr className="detalle-reporte-modal__divider" />
              <div className="detalle-reporte-modal__field">
                <span className="detalle-reporte-modal__label">Evidencia</span>
                <div className="detalle-reporte-modal__img-wrap">
                  <Image src={r.link_imagen} alt="Evidencia" fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              </div>
            </>
          )}
        </div>

        {mostrarPanelPublicacion && r.publicacion && (
          <div className="detalle-reporte-modal__publicacion-panel">
            <div className="detalle-reporte-modal__publicacion-panel-header">
              <h3 className="detalle-reporte-modal__publicacion-panel-title">Publicación</h3>
              <button
                type="button"
                className="detalle-reporte-modal__publicacion-panel-close"
                onClick={() => setPublicacionAbierta(false)}
                aria-label="Cerrar publicación"
              >
                <X size={16} />
              </button>
            </div>
            <div className="detalle-reporte-modal__publicacion-panel-body">
              {cargandoPublicacion && (
                <div className="detalle-reporte-modal__publicacion-loading">
                  <Loader2 size={20} className="post-modal__save-spinner" />
                </div>
              )}

              {!cargandoPublicacion && publicacionData && (
                <div className="post-modal__detail">
                  <div className="post-modal__top">
                    <button
                      type="button"
                      className="post-modal__seller post-modal__seller--clickable"
                      onClick={() => { router.push(`/vendedor/${publicacionData.usuario.id_usuario}`); onClose(); }}
                    >
                      <div className="post-modal__seller-avatar">
                        {publicacionData.usuario.url_foto_perfil ? (
                          <Image
                            src={publicacionData.usuario.url_foto_perfil}
                            alt={publicacionData.usuario.nombre}
                            fill
                            className="post-modal__seller-img"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <UserCircle2 size={40} strokeWidth={1} className="post-modal__seller-placeholder" />
                        )}
                      </div>
                      <div className="post-modal__seller-info">
                        <span className="post-modal__seller-name">{publicacionData.usuario.nombre}</span>
                        <div className="post-modal__stars">
                          {Array.from({ length: MAX_STARS }).map((_, i) => (
                            <span
                              key={i}
                              className={`post-modal__star${i < publicacionData.usuario.calificacion ? " post-modal__star--filled" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>

                    <div className="post-modal__estado">
                      <EstadoTag estado={publicacionData.estadoRel.estado} />
                    </div>
                  </div>

                  <div className="post-modal__carousel">
                    <CarruselImagen images={carouselImages} altText={publicacionData.titulo} />
                  </div>

                  {tags.length > 0 && (
                    <div className="post-modal__tags">
                      {tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} size="sm" />
                      ))}
                    </div>
                  )}

                  <div className="post-modal__price-row">
                    <h2 className="post-modal__title">{publicacionData.titulo}</h2>
                    <span className="post-modal__price">Q{publicacionData.precio}</span>
                  </div>

                  <p className="post-modal__description">{publicacionData.descripcion}</p>

                  <div className="post-modal__likes">
                    <span className="post-modal__likes-count">{publicacionData.me_gusta} me gusta</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        <div className="detalle-reporte-modal__footer">
          <button type="button" className="detalle-reporte-modal__btn-cancel" onClick={onClose}>
            Cerrar
          </button>
          {onMarcarResuelto && r.estadoRel.estado.toLowerCase() === "pendiente" && (
            <button type="button" className="button button--medium" onClick={onMarcarResuelto}>
              Marcar resuelto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}