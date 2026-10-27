"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ContactarUsuarioModal from "../../../ui/Modal/ContactarUsuario/ContactarUsuarioModal";
import "../../../ui/Button/Button.css";

interface EnviarMensajeButtonProps {
  userId: number;
  userName: string;
  userImageUrl?: string;
}

export default function EnviarMensajeButton({ userId, userName, userImageUrl }: EnviarMensajeButtonProps) {
  const locale = useLocale();
  const router = useRouter();
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleEnviarMensaje = (mensaje: string) => {
    const params = new URLSearchParams({
      compose: "1",
      recipient: userName,
      sellerId: String(userId),
      message: mensaje,
    });
    if (userImageUrl) params.set("postImageUrl", userImageUrl);

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
