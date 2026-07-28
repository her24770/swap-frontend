"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, ChevronLeft, MapPin, MoreVertical, UserCircle2 } from "lucide-react";
import AcuerdoBanner from "./AcuerdoBanner/AcuerdoBanner";
import ChatPanel from "../ChatPanel/ChatPanel";
import ChatInput from "./ChatInput/ChatInput";
import HistorialAcuerdosPanel from "./HistorialAcuerdosPanel/HistorialAcuerdosPanel";
import MensajesBurbuja from "./MensajesBurbuja/MensajesBurbuja";
import { useAuthStore } from "../../../store/authStore";
import type { AcuerdoHistorial } from "../../../types/acuerdo";
import type { ConversacionPreview, Mensaje, TipoPanel } from "../../../types/chat";
import "./ChatPrincipal.css";

interface ChatprincipalProps {
  conversacion: ConversacionPreview;
  mensajes: Mensaje[];
  acuerdo?: AcuerdoHistorial | null;
  onEnviar: (texto: string) => void;
  onEnviarImagen?: (archivo: File) => void;
  onAceptarAcuerdo?: () => void;
  onRechazarAcuerdo?: () => void;
  onEnviarNuevaPropuesta?: () => void;
  onCrearEncuentro?: () => void;
  onCompletarAcuerdo?: () => void;
  onVolver?: () => void;
}

export default function Chatprincipal({
  conversacion,
  mensajes,
  acuerdo,
  onEnviar,
  onEnviarImagen,
  onAceptarAcuerdo,
  onRechazarAcuerdo,
  onEnviarNuevaPropuesta,
  onCrearEncuentro,
  onCompletarAcuerdo,
  onVolver,
}: ChatprincipalProps) {
  const t = useTranslations("chat");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [panel, setPanel] = useState<TipoPanel>(null);
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const puedeGestionarAcuerdos = !conversacion.esSolicitud;
  const esPropuestaPendiente = Boolean(
    acuerdo
    && acuerdo.estadoRel?.estado === "pendiente"
    && idUsuarioActual != null
    && acuerdo.id_usuario !== idUsuarioActual,
  );
  const esPropuestaEnviada = Boolean(
    acuerdo
    && acuerdo.estadoRel?.estado === "pendiente"
    && idUsuarioActual != null
    && acuerdo.id_usuario === idUsuarioActual,
  );
  const esAcuerdoActivo = Boolean(acuerdo && acuerdo.estadoRel?.estado === "activo");

  return (
    <div className="chat-principal">
      <div className="chat-principal__header">
        <div className="chat-principal__header-left">
          {onVolver && (
            <button
              type="button"
              className="chat-principal__back-btn"
              aria-label={t("header.back")}
              onClick={onVolver}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="chat-principal__avatar">
            {conversacion.avatarUrl
              ? <img src={conversacion.avatarUrl} alt={conversacion.nombre} />
              : <UserCircle2 size={22} strokeWidth={1.2} />
            }
          </div>
          <span className="chat-principal__name">{conversacion.nombre}</span>
        </div>

        <div className="chat-principal__menu">
          <button
            type="button"
            className="chat-principal__menu-btn"
            aria-label={t("header.options")}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((prev) => !prev)}
          >
            <MoreVertical size={18} />
          </button>
          {menuAbierto && (
            <div className="chat-principal__dropdown">
              <button
                type="button"
                className="chat-principal__dropdown-item"
                onClick={() => {
                  setMenuAbierto(false);
                  setPanel(panel === "historial" ? null : "historial");
                }}
              >
                {t("menu.agreementHistory")}
              </button>
              {puedeGestionarAcuerdos && (
                <button
                  type="button"
                  className="chat-principal__dropdown-item"
                  onClick={() => {
                    setMenuAbierto(false);
                    onCrearEncuentro?.();
                  }}
                >
                  {t("menu.createAgreement")}
                </button>
              )}
              <button
                type="button"
                className="chat-principal__dropdown-item chat-principal__dropdown-item--danger"
                onClick={() => setMenuAbierto(false)}
              >
                {t("menu.report")}
              </button>
            </div>
          )}
        </div>
      </div>

      <AcuerdoBanner
        acuerdo={acuerdo}
        publicacion={conversacion.publicacion}
        esPropuestaPendiente={esPropuestaPendiente}
        esPropuestaEnviada={esPropuestaEnviada}
        onDetalles={() => setPanel(panel === "acuerdo" ? null : "acuerdo")}
        onCrear={puedeGestionarAcuerdos ? onCrearEncuentro : undefined}
      />

      <div className="chat-principal__body">
        <MensajesBurbuja
          mensajes={mensajes}
          avatarUrl={conversacion.avatarUrl}
          idUsuarioActual={idUsuarioActual}
        />
        {panel === "acuerdo" && acuerdo && (
          <ChatPanel tipo="acuerdo" onClose={() => setPanel(null)}>
            <div className="chat-principal__acuerdo-detail">
              <h3 className="chat-principal__acuerdo-title">{acuerdo.publicacion.titulo}</h3>
              <p className="chat-principal__acuerdo-price">Q{acuerdo.publicacion.precio}</p>
              <div className="chat-principal__acuerdo-meta">
                <span>
                  <MapPin size={14} />
                  {acuerdo.lugar_entrega}
                </span>
                <span>
                  <Calendar size={14} />
                  {acuerdo.fecha_entrega}
                </span>
              </div>
              {acuerdo.observaciones && (
                <div className="chat-principal__acuerdo-notes">
                  <strong>{t("agreement.notes")}</strong>
                  <p>{acuerdo.observaciones}</p>
                </div>
              )}
              {esPropuestaPendiente && (
                <div className="chat-principal__acuerdo-actions">
                  <button
                    type="button"
                    className="chat-principal__action-btn chat-principal__action-btn--accept"
                    onClick={() => {
                      onAceptarAcuerdo?.();
                      setPanel(null);
                    }}
                  >
                    {t("agreement.accept")}
                  </button>
                  <button
                    type="button"
                    className="chat-principal__action-btn chat-principal__action-btn--ghost"
                    onClick={() => {
                      if (puedeGestionarAcuerdos) {
                        onEnviarNuevaPropuesta?.();
                      }
                      setPanel(null);
                    }}
                    disabled={!puedeGestionarAcuerdos}
                  >
                    {t("agreement.sendNew")}
                  </button>
                  <button
                    type="button"
                    className="chat-principal__action-btn chat-principal__action-btn--danger"
                    onClick={() => {
                      onRechazarAcuerdo?.();
                      setPanel(null);
                    }}
                  >
                    {t("agreement.reject")}
                  </button>
                </div>
              )}
              {esPropuestaEnviada && (
                <p className="chat-principal__acuerdo-status">
                  {t("agreement.pendingResponse")}
                </p>
              )}
              {esAcuerdoActivo && (
                <div className="chat-principal__acuerdo-actions">
                  <button
                    type="button"
                    className="chat-principal__action-btn chat-principal__action-btn--accept"
                    onClick={() => {
                      onCompletarAcuerdo?.();
                      setPanel(null);
                    }}
                  >
                    {t("agreement.markCompleted")}
                  </button>
                </div>
              )}
            </div>
          </ChatPanel>
        )}
        {panel === "historial" && (
          <ChatPanel tipo="historial" onClose={() => setPanel(null)}>
            <HistorialAcuerdosPanel idConversacion={conversacion.id_conversacion} />
          </ChatPanel>
        )}
      </div>

      <ChatInput onEnviar={onEnviar} />
    </div>
  );
}