"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import "../../Button/Button.css";
import "./EnviarMensaje.css";

export type TipoPublicacionMensaje = "venta" | "tutoria" | "negocio" | "material";

const SUGERENCIAS_POR_TIPO: Record<TipoPublicacionMensaje, (titulo: string) => string[]> = {
  venta: (titulo) => [
    `Hola, ¿tu publicación "${titulo}" todavía está disponible?`,
    `¿Cuál es el precio final de "${titulo}"?`,
    `¿Puedes hacer delivery de "${titulo}"?`,
    `¿"${titulo}" tiene garantía?`,
    `Me interesa "${titulo}", ¿podemos acordar un encuentro?`,
  ],
  material: (titulo) => [
    `Hola, ¿el material "${titulo}" todavía está disponible?`,
    `¿"${titulo}" está en buen estado?`,
    `¿Puedes traer "${titulo}" al campus?`,
    `¿Aceptas regateo por "${titulo}"?`,
    `¿Cuánto tiempo usaste "${titulo}"?`,
  ],
  tutoria: (titulo) => [
    `Hola, me interesa tu tutoría de "${titulo}". ¿Tienes disponibilidad esta semana?`,
    `¿Das clases virtuales de "${titulo}"?`,
    `¿Cuánto cobras por hora de tutoría en "${titulo}"?`,
    `¿Tienes experiencia dando clases de "${titulo}"?`,
    `Me gustaría agendar una sesión de "${titulo}"`,
  ],
  negocio: (titulo) => [
    `Hola, tengo una consulta sobre tu negocio "${titulo}". ¿Hacen pedidos personalizados?`,
    `¿"${titulo}" tiene menú del día?`,
    `¿"${titulo}" hace delivery al campus?`,
    `¿Cuáles son los horarios de "${titulo}"?`,
    `¿"${titulo}" acepta pago con transferencia?`,
  ],
};

interface PublicacionResumen {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  imagenUrl?: string;
  tipo: TipoPublicacionMensaje;
}

interface EnviarMensajePanelProps {
  onClose: () => void;
  destinatarioNombre: string;
  publicacion: PublicacionResumen;
  onEnviar: (mensaje: string) => void;
  isSending?: boolean;
}

export default function EnviarMensajePanel({
  onClose,
  destinatarioNombre,
  publicacion,
  onEnviar,
  isSending = false,
}: EnviarMensajePanelProps) {
  const t = useTranslations("sendMessageModal");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sugerencias = useMemo(
    () => (SUGERENCIAS_POR_TIPO[publicacion.tipo] ?? SUGERENCIAS_POR_TIPO.venta)(publicacion.titulo),
    [publicacion.tipo, publicacion.titulo],
  );
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setMensaje(sugerencias[0] ?? "");
    setDropdownOpen(false);
  }, [sugerencias]);

  const handleSugerencia = (texto: string) => {
    setMensaje(texto);
    setDropdownOpen(false);
  };

  const handleEnviar = () => {
    if (!mensaje.trim()) return;
    onEnviar(mensaje.trim());
  };

  return (
    <div className="enviar-mensaje-panel">
      <div className="enviar-mensaje-panel__header">
        <h2 className="enviar-mensaje-panel__title">
          {t("title", { name: destinatarioNombre })}
        </h2>
      </div>

      <div className="enviar-mensaje-panel__section">
        <label className="enviar-mensaje-panel__label">{t("suggestionsLabel")}</label>
        <div className="enviar-mensaje-panel__dropdown">
          <button
            type="button"
            className={`enviar-mensaje-panel__dropdown-trigger${dropdownOpen ? " enviar-mensaje-panel__dropdown-trigger--open" : ""}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span>
              {mensaje && sugerencias.includes(mensaje)
                ? mensaje
                : t("selectSuggestion")}
            </span>
            <ChevronDown
              size={16}
              className={`enviar-mensaje-panel__chevron${dropdownOpen ? " enviar-mensaje-panel__chevron--open" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="enviar-mensaje-panel__dropdown-menu">
              {sugerencias.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`enviar-mensaje-panel__dropdown-option${mensaje === s ? " enviar-mensaje-panel__dropdown-option--active" : ""}`}
                  onClick={() => handleSugerencia(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="enviar-mensaje-panel__section enviar-mensaje-panel__section--grow">
        <label className="enviar-mensaje-panel__label">{t("messageLabel")}</label>
        <textarea
          className="enviar-mensaje-panel__textarea"
          placeholder={t("placeholder")}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
        />
        <span className="enviar-mensaje-panel__hint">{t("hint")}</span>
      </div>

      <div className="enviar-mensaje-panel__footer">
        <button
          type="button"
          className="enviar-mensaje-panel__btn-cancel"
          onClick={onClose}
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          className="button button--medium"
          onClick={handleEnviar}
          disabled={!mensaje.trim() || isSending}
        >
          {isSending ? t("sending") : t("send")}
          {!isSending && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
