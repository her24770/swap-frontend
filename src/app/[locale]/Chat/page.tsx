"use client";

import { useMemo, useState } from "react";
import ChatPrincipal from "../../../components/Chat/ChatPrincipal/ChatPrincipal";
import ChatSidebar from "../../../components/Chat/ChatSidebar/chatsidebar";
import type { AcuerdoHistorial } from "../../../types/acuerdo";
import type { ConversacionPreview, Mensaje, TabMensajes } from "../../../types/chat";
import "./ChatPage.css";

const MOCK_CONVERSACIONES: ConversacionPreview[] = [
  {
    id_conversacion: 1,
    nombre: "Andrea Lopez",
    preview: "Te confirmo la entrega para manana.",
    fecha_ultimo_mensaje: "09:15",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    id_conversacion: 2,
    nombre: "Carlos Mendez",
    preview: "Sigo interesado en la publicacion.",
    esSolicitud: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
  },
  {
    id_conversacion: 3,
    nombre: "Maria Jose",
    preview: "Nos vemos hoy en el campus central.",
    fecha_ultimo_mensaje: "18:40",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
];

const CONVERSACION_TAB: Record<number, Exclude<TabMensajes, "todas">> = {
  1: "compras",
  2: "ventas",
  3: "ventas",
};

const MOCK_MENSAJES: Record<number, Mensaje[]> = {
  1: [
    {
      id_mensaje: 101,
      id_conversacion: 1,
      id_emisor: 12,
      mensaje: "Hola, puedo entregartelo hoy despues de clases.",
      estado_mensaje: 1,
      fecha_enviado: "09:00",
    },
    {
      id_mensaje: 102,
      id_conversacion: 1,
      id_emisor: 1,
      mensaje: "Perfecto, me queda bien a las 5.",
      estado_mensaje: 1,
      fecha_enviado: "09:08",
    },
    {
      id_mensaje: 103,
      id_conversacion: 1,
      id_emisor: 12,
      mensaje: "Te confirmo la entrega para manana.",
      estado_mensaje: 1,
      fecha_enviado: "09:15",
    },
  ],
  2: [
    {
      id_mensaje: 201,
      id_conversacion: 2,
      id_emisor: 18,
      mensaje: "Hola, aun tienes disponible el teclado?",
      estado_mensaje: 1,
      fecha_enviado: "11:20",
    },
    {
      id_mensaje: 202,
      id_conversacion: 2,
      id_emisor: 18,
      mensaje: "Sigo interesado en la publicacion.",
      estado_mensaje: 1,
      fecha_enviado: "11:24",
    },
  ],
  3: [
    {
      id_mensaje: 301,
      id_conversacion: 3,
      id_emisor: 1,
      mensaje: "Llego en diez minutos.",
      estado_mensaje: 1,
      fecha_enviado: "18:31",
    },
    {
      id_mensaje: 302,
      id_conversacion: 3,
      id_emisor: 27,
      mensaje: "Buenisimo, estoy frente a biblioteca.",
      estado_mensaje: 1,
      fecha_enviado: "18:35",
    },
    {
      id_mensaje: 303,
      id_conversacion: 3,
      id_emisor: 27,
      mensaje: "Nos vemos hoy en el campus central.",
      estado_mensaje: 1,
      fecha_enviado: "18:40",
    },
  ],
};

const MOCK_ACUERDOS: Record<number, AcuerdoHistorial | null> = {
  1: {
    id_acuerdo: 1,
    id_usuario: 1,
    id_publicacion: 44,
    fecha_entrega: "2026-07-24 17:00",
    lugar_entrega: "Plaza Paiz Roosevelt",
    observaciones: "Llevar cambio exacto.",
    id_conversacion: 1,
    estado: 1,
    publicacion: {
      id_publicacion: 44,
      titulo: "Lampara LED de escritorio",
      descripcion: "Lampara recargable con tres niveles de brillo.",
      precio: "85.00",
      estado: 1,
      tipo_publicacion: 1,
      me_gusta: 12,
      fecha_publicacion: "2026-07-20",
      id_usuario: 12,
      imagenes: [
        {
          id_imagen: 1,
          url_imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
          id_publicacion: 44,
        },
      ],
      usuario: {
        id_usuario: 12,
        nombre: "Andrea Lopez",
        url_foto_perfil: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
        calificacion: 4.8,
      },
    },
    estadoRel: {
      id_estado: 1,
      estado: "activo",
    },
  },
  2: null,
  3: {
    id_acuerdo: 2,
    id_usuario: 1,
    id_publicacion: 91,
    fecha_entrega: "2026-07-23 19:00",
    lugar_entrega: "Campus central, biblioteca",
    observaciones: "Avisar al llegar.",
    id_conversacion: 3,
    estado: 1,
    publicacion: {
      id_publicacion: 91,
      titulo: "Apuntes de Calculo II",
      descripcion: "Resumen completo con ejercicios resueltos.",
      precio: "25.00",
      estado: 1,
      tipo_publicacion: 2,
      me_gusta: 8,
      fecha_publicacion: "2026-07-18",
      id_usuario: 27,
      imagenes: [
        {
          id_imagen: 2,
          url_imagen: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
          id_publicacion: 91,
        },
      ],
      tipoPerfil: {
        id_tipo_perfil: 1,
        tipo_perfil: "venta",
      },
      usuario: {
        id_usuario: 27,
        nombre: "Maria Jose",
        url_foto_perfil: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
        calificacion: 4.6,
      },
    },
    estadoRel: {
      id_estado: 1,
      estado: "activo",
    },
  },
};

export default function ChatPage() {
  const [tab, setTab] = useState<TabMensajes>("todas");
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [mostrarChatMovil, setMostrarChatMovil] = useState(false);
  const [mensajesPorConversacion, setMensajesPorConversacion] =
    useState<Record<number, Mensaje[]>>(MOCK_MENSAJES);

  const conversaciones = useMemo(() => {
    if (tab === "todas") return MOCK_CONVERSACIONES;

    return MOCK_CONVERSACIONES.filter(
      (conversacion) => CONVERSACION_TAB[conversacion.id_conversacion] === tab,
    );
  }, [tab]);

  const selected =
    conversaciones.find((conversacion) => conversacion.id_conversacion === selectedId)
    ?? conversaciones[0]
    ?? null;

  const mensajes = selected
    ? mensajesPorConversacion[selected.id_conversacion] ?? []
    : [];

  const acuerdo = selected
    ? MOCK_ACUERDOS[selected.id_conversacion] ?? null
    : null;

  const handleEnviar = (texto: string) => {
    if (!selected) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: selected.id_conversacion,
      id_emisor: 1,
      mensaje: texto,
      estado_mensaje: 1,
      fecha_enviado: new Date().toLocaleTimeString("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMensajesPorConversacion((prev) => ({
      ...prev,
      [selected.id_conversacion]: [...(prev[selected.id_conversacion] ?? []), nuevoMensaje],
    }));
  };

  return (
    <div className={`mensajes-page${mostrarChatMovil ? " mensajes-page--chat-open" : ""}`}>
      <ChatSidebar
        conversaciones={conversaciones}
        selectedId={selected?.id_conversacion ?? null}
        tab={tab}
        onTabChange={setTab}
        onSelect={(conversacion) => {
          setSelectedId(conversacion.id_conversacion);
          setMostrarChatMovil(true);
        }}
        onConfirmar={(id) => console.log("confirmar", id)}
        onEliminar={(id) => console.log("eliminar", id)}
      />

      {selected ? (
        <ChatPrincipal
          conversacion={selected}
          mensajes={mensajes}
          acuerdo={acuerdo}
          onEnviar={handleEnviar}
          onCrearEncuentro={() => console.log("crear acuerdo")}
          onVolver={() => setMostrarChatMovil(false)}
        />
      ) : (
        <div className="mensajes-page__empty">
          Selecciona una conversacion
        </div>
      )}
    </div>
  );
}
