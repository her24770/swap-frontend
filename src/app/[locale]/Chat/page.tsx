"use client";

import { useState } from "react";
import ChatSidebar from "../../../components/Chat/ChatSidebar/chatsidebar";
import type {
  ConversacionPreview,
  Mensaje,
  TabMensajes,
} from "../../../types/chat";
import "./ChatPage.css";

const MOCK_CONVS: ConversacionPreview[] = [
  {
    id_conversacion: 1,
    nombre: "Michael",
    preview: "Estoy interesado en el producto",
    esSolicitud: true,
    fecha_ultimo_mensaje: "09:00",
    ultimo_mensaje: {
      id_mensaje: 1,
      id_conversacion: 1,
      id_emisor: 2,
      mensaje: "Estoy interesado en el producto",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-22T09:00:00.000Z",
    },
  },
  {
    id_conversacion: 2,
    nombre: "Michael",
    preview: "Nos vemos manana",
    fecha_ultimo_mensaje: "09:00",
    ultimo_mensaje: {
      id_mensaje: 2,
      id_conversacion: 2,
      id_emisor: 1,
      mensaje: "Nos vemos manana",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-22T09:00:00.000Z",
    },
  },
  {
    id_conversacion: 3,
    nombre: "Michael",
    preview: "Te escribo mas tarde",
    fecha_ultimo_mensaje: "11:15",
    ultimo_mensaje: {
      id_mensaje: 3,
      id_conversacion: 3,
      id_emisor: 2,
      mensaje: "Te escribo mas tarde",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-22T11:15:00.000Z",
    },
  },
];

const MOCK_MENSAJES: Mensaje[] = [
  {
    id_mensaje: 1,
    id_conversacion: 2,
    id_emisor: 1,
    mensaje: "Texto del mensaje",
    estado_mensaje: 1,
    fecha_enviado: "2026-07-22T14:00:00.000Z",
  },
  {
    id_mensaje: 2,
    id_conversacion: 2,
    id_emisor: 1,
    mensaje: "Texto del mensaje",
    estado_mensaje: 1,
    fecha_enviado: "2026-07-22T14:00:00.000Z",
  },
];

export default function MensajesPage() {
  const [tab, setTab] = useState<TabMensajes>("todas");
  const [selectedId, setSelectedId] = useState<number | null>(2);
  const [mensajes, setMensajes] = useState<Mensaje[]>(MOCK_MENSAJES);

  const selected = MOCK_CONVS.find((c) => c.id_conversacion === selectedId) ?? null;

  const handleEnviar = (texto: string) => {
    setMensajes((prev) => [
      ...prev,
      {
        id_mensaje: Date.now(),
        id_conversacion: selectedId ?? 0,
        id_emisor: 1,
        mensaje: texto,
        estado_mensaje: 1,
        fecha_enviado: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="mensajes-page">
      <ChatSidebar
        conversaciones={MOCK_CONVS}
        selectedId={selectedId}
        tab={tab}
        onTabChange={setTab}
        onSelect={(c) => setSelectedId(c.id_conversacion)}
        onConfirmar={(id) => console.log("confirmar", id)}
        onEliminar={(id) => console.log("eliminar", id)}
      />
    </div>
  );
}
