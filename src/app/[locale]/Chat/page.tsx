"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ChatPrincipal from "../../../components/Chat/ChatPrincipal/ChatPrincipal";
import ChatSidebar from "../../../components/Chat/ChatSidebar/chatsidebar";
import type { AcuerdoHistorial } from "../../../types/acuerdo";
import type { ConversacionPreview, Mensaje, TabMensajes } from "../../../types/chat";
import "./ChatPage.css";

const USUARIO_ACTUAL_ID = 1;

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
      fecha_enviado: "2026-07-23T09:00:00",
    },
    {
      id_mensaje: 102,
      id_conversacion: 1,
      id_emisor: 1,
      mensaje: "Perfecto, me queda bien a las 5.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-23T09:08:00",
    },
    {
      id_mensaje: 103,
      id_conversacion: 1,
      id_emisor: 12,
      mensaje: "Te confirmo la entrega para manana.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-23T09:15:00",
    },
  ],
  2: [
    {
      id_mensaje: 201,
      id_conversacion: 2,
      id_emisor: 18,
      mensaje: "Hola, aun tienes disponible el teclado?",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-22T11:20:00",
    },
    {
      id_mensaje: 202,
      id_conversacion: 2,
      id_emisor: 18,
      mensaje: "Sigo interesado en la publicacion.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-22T11:24:00",
    },
  ],
  3: [
    {
      id_mensaje: 301,
      id_conversacion: 3,
      id_emisor: 1,
      mensaje: "Llego en diez minutos.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-21T18:31:00",
    },
    {
      id_mensaje: 302,
      id_conversacion: 3,
      id_emisor: 27,
      mensaje: "Buenisimo, estoy frente a biblioteca.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-23T18:35:00",
    },
    {
      id_mensaje: 303,
      id_conversacion: 3,
      id_emisor: 27,
      mensaje: "Nos vemos hoy en el campus central.",
      estado_mensaje: 1,
      fecha_enviado: "2026-07-23T18:40:00",
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
  2: {
    id_acuerdo: 5,
    id_usuario: 18,
    id_publicacion: 67,
    fecha_entrega: "2026-07-24 14:30",
    lugar_entrega: "Centro comercial Miraflores",
    observaciones: "Puedo llevarlo en su caja original.",
    id_conversacion: 2,
    estado: 2,
    publicacion: {
      id_publicacion: 67,
      titulo: "Teclado mecanico Red Switch",
      descripcion: "Teclado mecanico full size con iluminacion RGB.",
      precio: "240.00",
      estado: 1,
      tipo_publicacion: 1,
      me_gusta: 19,
      fecha_publicacion: "2026-07-19",
      id_usuario: 18,
      imagenes: [
        {
          id_imagen: 5,
          url_imagen: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
          id_publicacion: 67,
        },
      ],
      usuario: {
        id_usuario: 18,
        nombre: "Carlos Mendez",
        url_foto_perfil: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
        calificacion: 4.7,
      },
    },
    estadoRel: {
      id_estado: 2,
      estado: "pendiente",
    },
  },
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

function crearNuevaPropuesta(acuerdo: AcuerdoHistorial): AcuerdoHistorial {
  return {
    ...acuerdo,
    id_acuerdo: Date.now(),
    id_usuario: USUARIO_ACTUAL_ID,
    fecha_entrega: "2026-07-24 16:30",
    lugar_entrega: "Edificio T3, entrada principal",
    observaciones: "Nueva propuesta enviada por ti.",
    estado: 2,
    estadoRel: {
      id_estado: 2,
      estado: "pendiente",
    },
  };
}

function obtenerPesoRecencia(fechaUltimoMensaje?: string): number {
  if (!fechaUltimoMensaje) return -1;

  const coincidenciaHora = fechaUltimoMensaje.match(/^(\d{1,2}):(\d{2})$/);
  if (!coincidenciaHora) return -1;

  const horas = Number(coincidenciaHora[1]);
  const minutos = Number(coincidenciaHora[2]);
  return (horas * 60) + minutos;
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const [tab, setTab] = useState<TabMensajes>("todas");
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [mostrarChatMovil, setMostrarChatMovil] = useState(false);
  const [conversacionesState, setConversacionesState] =
    useState<ConversacionPreview[]>(MOCK_CONVERSACIONES);
  const [acuerdosState, setAcuerdosState] =
    useState<Record<number, AcuerdoHistorial | null>>(MOCK_ACUERDOS);
  const [mensajesPorConversacion, setMensajesPorConversacion] =
    useState<Record<number, Mensaje[]>>(MOCK_MENSAJES);

  const conversaciones = useMemo(() => {
    const conversacionesFiltradas = tab === "todas"
      ? conversacionesState
      : conversacionesState.filter(
        (conversacion) => CONVERSACION_TAB[conversacion.id_conversacion] === tab,
      );

    return [...conversacionesFiltradas].sort((a, b) => {
      const prioridadSolicitudA = a.esSolicitud ? 1 : 0;
      const prioridadSolicitudB = b.esSolicitud ? 1 : 0;

      if (prioridadSolicitudA !== prioridadSolicitudB) {
        return prioridadSolicitudB - prioridadSolicitudA;
      }

      return obtenerPesoRecencia(b.fecha_ultimo_mensaje) - obtenerPesoRecencia(a.fecha_ultimo_mensaje);
    });
  }, [conversacionesState, tab]);

  const selected =
    conversaciones.find((conversacion) => conversacion.id_conversacion === selectedId)
    ?? conversaciones[0]
    ?? null;

  const mensajes = selected
    ? mensajesPorConversacion[selected.id_conversacion] ?? []
    : [];

  const acuerdo = selected
    ? acuerdosState[selected.id_conversacion] ?? null
    : null;

  const obtenerHoraActual = () =>
    new Date().toLocaleTimeString("es-GT", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const obtenerFechaHoraActual = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    const hour = String(ahora.getHours()).padStart(2, "0");
    const minute = String(ahora.getMinutes()).padStart(2, "0");
    const second = String(ahora.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  };

  const handleEnviar = (texto: string) => {
    if (!selected) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: selected.id_conversacion,
      id_emisor: 1,
      mensaje: texto,
      estado_mensaje: 1,
      fecha_enviado: obtenerFechaHoraActual(),
    };

    setMensajesPorConversacion((prev) => ({
      ...prev,
      [selected.id_conversacion]: [...(prev[selected.id_conversacion] ?? []), nuevoMensaje],
    }));
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === selected.id_conversacion
        ? {
          ...conversacion,
          preview: texto,
          fecha_ultimo_mensaje: nuevoMensaje.fecha_enviado,
        }
        : conversacion
    )));
  };

  const handleEnviarImagen = (archivo: File) => {
    if (!selected) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: selected.id_conversacion,
      id_emisor: 1,
      mensaje: `${t("system.attachedImageMessage")} ${archivo.name}`,
      estado_mensaje: 1,
      fecha_enviado: obtenerFechaHoraActual(),
    };

    setMensajesPorConversacion((prev) => ({
      ...prev,
      [selected.id_conversacion]: [...(prev[selected.id_conversacion] ?? []), nuevoMensaje],
    }));
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === selected.id_conversacion
        ? {
          ...conversacion,
          preview: `${t("system.imagePreview")} ${archivo.name}`,
          fecha_ultimo_mensaje: nuevoMensaje.fecha_enviado,
        }
        : conversacion
    )));
  };

  const handleConfirmar = (id: number) => {
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === id
        ? { ...conversacion, esSolicitud: false, fecha_ultimo_mensaje: conversacion.fecha_ultimo_mensaje ?? obtenerHoraActual() }
        : conversacion
    )));
  };

  const handleEliminar = (id: number) => {
    setConversacionesState((prev) => prev.filter((conversacion) => conversacion.id_conversacion !== id));
    setMensajesPorConversacion((prev) => {
      const actualizado = { ...prev };
      delete actualizado[id];
      return actualizado;
    });
    if (selectedId === id) {
      setSelectedId(null);
      setMostrarChatMovil(false);
    }
  };

  const handleAceptarAcuerdo = (idConversacion: number) => {
    setAcuerdosState((prev) => {
      const actual = prev[idConversacion];
      if (!actual) return prev;

      return {
        ...prev,
        [idConversacion]: {
          ...actual,
          estado: 1,
          estadoRel: {
            id_estado: 1,
            estado: "activo",
          },
        },
      };
    });
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === idConversacion
        ? { ...conversacion, preview: t("system.agreementAccepted") }
        : conversacion
    )));
  };

  const handleRechazarAcuerdo = (idConversacion: number) => {
    setAcuerdosState((prev) => ({
      ...prev,
      [idConversacion]: null,
    }));
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === idConversacion
        ? { ...conversacion, preview: t("system.agreementRejected") }
        : conversacion
    )));
  };

  const handleEnviarNuevaPropuesta = (idConversacion: number) => {
    setAcuerdosState((prev) => {
      const actual = prev[idConversacion];
      if (!actual) return prev;

      return {
        ...prev,
        [idConversacion]: crearNuevaPropuesta(actual),
      };
    });
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === idConversacion
        ? { ...conversacion, preview: t("system.newAgreementProposalSent") }
        : conversacion
    )));
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
        onConfirmar={handleConfirmar}
        onEliminar={handleEliminar}
      />

      {selected ? (
        <ChatPrincipal
          conversacion={selected}
          mensajes={mensajes}
          acuerdo={acuerdo}
          onEnviar={handleEnviar}
          onEnviarImagen={handleEnviarImagen}
          onAceptarAcuerdo={() => selected && handleAceptarAcuerdo(selected.id_conversacion)}
          onRechazarAcuerdo={() => selected && handleRechazarAcuerdo(selected.id_conversacion)}
          onEnviarNuevaPropuesta={() => selected && handleEnviarNuevaPropuesta(selected.id_conversacion)}
          onCrearEncuentro={() => console.log("crear acuerdo")}
          onVolver={() => setMostrarChatMovil(false)}
        />
      ) : (
        <div className="mensajes-page__empty">
          {t("empty.selectConversation")}
        </div>
      )}
    </div>
  );
}
