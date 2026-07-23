import { UserCircle2 } from "lucide-react";
import type { Mensaje } from "../../../../types/chat";
import "./MensajesBurbuja.css";

interface MensajesBurbujaProps {
  mensajes: Mensaje[];
  avatarUrl?: string;
  idUsuarioActual?: number;
}

export default function MensajesBurbuja({
  mensajes,
  avatarUrl,
  idUsuarioActual,
}: MensajesBurbujaProps) {
  return (
    <div className="mensajes-burbuja">
      <div className="mensajes-burbuja__day">HOY</div>
      {mensajes.map((msg) => {
        const esMio = idUsuarioActual != null && msg.id_emisor === idUsuarioActual;

        return (
          <div
            key={msg.id_mensaje}
            className={`mensajes-burbuja__msg${esMio ? " mensajes-burbuja__msg--mio" : ""}`}
          >
            {!esMio && (
              <div className="mensajes-burbuja__avatar">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="mensajes-burbuja__avatar-img" />
                  : <UserCircle2 size={18} strokeWidth={1.2} />
                }
              </div>
            )}
            <div className={`mensajes-burbuja__bubble${esMio ? " mensajes-burbuja__bubble--mio" : " mensajes-burbuja__bubble--otro"}`}>
              {msg.mensaje}
              <span className="mensajes-burbuja__hora">{msg.fecha_enviado}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
