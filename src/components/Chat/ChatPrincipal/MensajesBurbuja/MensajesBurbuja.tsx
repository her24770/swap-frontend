import { UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Mensaje } from "../../../../types/chat";
import "./MensajesBurbuja.css";

interface MensajesBurbujaProps {
  mensajes: Mensaje[];
  avatarUrl?: string;
  idUsuarioActual?: number;
}

function parseMessageDate(value: string): Date | null {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const timeOnlyMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeOnlyMatch) {
    return null;
  }

  const fallback = new Date();
  fallback.setHours(Number(timeOnlyMatch[1]), Number(timeOnlyMatch[2]), 0, 0);
  return fallback;
}

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getDayLabel(date: Date, t: ReturnType<typeof useTranslations<"chat.messages">>): string {
  const today = startOfDay(new Date());
  const messageDay = startOfDay(date);
  const diffMs = today.getTime() - messageDay.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays === 0) return t("today");
  if (diffDays === 1) return t("yesterday");

  return date.toLocaleDateString();
}

function formatMessageTime(value: string): string {
  const parsed = parseMessageDate(value);
  if (!parsed) return value;

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensajesBurbuja({
  mensajes,
  avatarUrl,
  idUsuarioActual,
}: MensajesBurbujaProps) {
  const t = useTranslations("chat.messages");

  return (
    <div className="mensajes-burbuja">
      {mensajes.map((msg, index) => {
        const esMio = idUsuarioActual != null && msg.id_emisor === idUsuarioActual;
        const fechaActual = parseMessageDate(msg.fecha_enviado);
        const fechaAnterior = index > 0 ? parseMessageDate(mensajes[index - 1].fecha_enviado) : null;
        const mostrarSeparadorDia =
          fechaActual != null &&
          (fechaAnterior == null || startOfDay(fechaActual).getTime() !== startOfDay(fechaAnterior).getTime());

        return (
          <div key={msg.id_mensaje}>
            {mostrarSeparadorDia && (
              <div className="mensajes-burbuja__day">{getDayLabel(fechaActual, t)}</div>
            )}
            <div className={`mensajes-burbuja__msg${esMio ? " mensajes-burbuja__msg--mio" : ""}`}>
              {!esMio && (
                <div className="mensajes-burbuja__avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={t("avatarAlt")} className="mensajes-burbuja__avatar-img" />
                  ) : (
                    <UserCircle2 size={18} strokeWidth={1.2} />
                  )}
                </div>
              )}
              <div className={`mensajes-burbuja__bubble${esMio ? " mensajes-burbuja__bubble--mio" : " mensajes-burbuja__bubble--otro"}`}>
                {msg.mensaje}
                <span className="mensajes-burbuja__hora">{formatMessageTime(msg.fecha_enviado)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
