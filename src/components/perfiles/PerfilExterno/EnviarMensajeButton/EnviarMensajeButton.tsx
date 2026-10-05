"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ContactarUsuarioModal from "../../../ui/Modal/ContactarUsuario/ContactarUsuarioModal";
import { useAuthStore } from "../../../../store/authStore";
import { useMiniChatStore } from "../../../../store/miniChatStore";
import type { Mensaje } from "../../../../types/chat";
import "../../../ui/Button/Button.css";

interface EnviarMensajeButtonProps {
  userId: number;
  userName: string;
  userImageUrl?: string;
}

export default function EnviarMensajeButton({ userId, userName, userImageUrl }: EnviarMensajeButtonProps) {
  const locale = useLocale();
  const router = useRouter();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const agregarMensajeMiniChat = useMiniChatStore((state) => state.agregarMensaje);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleEnviarMensaje = (mensaje: string) => {
    const params = new URLSearchParams({
      compose: "1",
      recipient: userName,
      sellerId: String(userId),
      message: mensaje,
    });
    if (userImageUrl) params.set("postImageUrl", userImageUrl);

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: userId,
      id_emisor: idUsuarioActual ?? 0,
      mensaje,
      estado_mensaje: 1,
      fecha_enviado: new Date().toISOString(),
    };
    agregarMensajeMiniChat(userId, { nombre: userName, avatarUrl: userImageUrl }, nuevoMensaje);

    setContactModalOpen(false);
    router.push(`/${locale}/Chat?${params.toString()}`);
  };

  return (
    <>
      <button
        type="button"
        className="button button--small"
        onClick={() => setContactModalOpen(true)}
      >
        <MessageCircle size={16} strokeWidth={1.8} aria-hidden />
        Enviar mensaje
      </button>

      {contactModalOpen && (
        <ContactarUsuarioModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          destinatarioNombre={userName}
          onEnviar={handleEnviarMensaje}
        />
      )}
    </>
  );
}
