"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ChatPrincipal from "../../../components/Chat/ChatPrincipal/ChatPrincipal";
import ChatSidebar from "../../../components/Chat/ChatSidebar/chatsidebar";
import SolicitudAcuerdoModal from "../../../components/ui/Modal/SolicitudAcuerdo/SolicitudAcuerdoModal";
import SeleccionPublicacionModal from "../../../components/ui/Modal/SeleccionPublicacionAcuerdo/SeleccionPublicacionAcuerdoModal";
import { conversacionService } from "../../../services/conversacionService";
import { useEstados } from "../../../hooks/useEstados";
import { useSocket } from "../../../hooks/useSocket";
import { useAcuerdosChat } from "../../../hooks/useAcuerdosChat";
import { useMensajesChat } from "../../../hooks/useMensajesChat";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import type { ConversacionPreview } from "../../../types/chat";
import "./ChatPage.css";

function obtenerPesoRecencia(fechaUltimoMensaje?: string): number {
  if (!fechaUltimoMensaje) return -1;

  const coincidenciaHora = fechaUltimoMensaje.match(/^(\d{1,2}):(\d{2})$/);
  if (!coincidenciaHora) return -1;

  const horas = Number(coincidenciaHora[1]);
  const minutos = Number(coincidenciaHora[2]);
  return (horas * 60) + minutos;
}

const obtenerHoraActual = () =>
  new Date().toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ChatPage() {
  const t = useTranslations("chat");
  const { agregarNotificacion } = useUIStore();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const estadosConversacion = useEstados("conversacion");
  const idEstadoActivo = estadosConversacion.find((e) => e.estado === "activo")?.id_estado;
  const idEstadoPendiente = estadosConversacion.find((e) => e.estado === "pendiente")?.id_estado;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mostrarChatMovil, setMostrarChatMovil] = useState(false);
  const [conversacionesState, setConversacionesState] =
    useState<ConversacionPreview[]>([]);
  const inicioConversacionEjecutado = useRef(false);

  useEffect(() => {
    if (!idUsuarioActual || estadosConversacion.length === 0) return;
    conversacionService.listar(idEstadoPendiente)
      .then(setConversacionesState)
      .catch(() => {
        agregarNotificacion({ tipo: "error", mensaje: t("system.agreementActionError") });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuarioActual, estadosConversacion.length, idEstadoPendiente]);

  // Inicia una conversación desde el perfil de otro usuario
  // (?compose=1&sellerId=X&message=...), creándola o reutilizando la existente.
  useEffect(() => {
    const compose = searchParams.get("compose");
    const sellerId = searchParams.get("sellerId");
    const message = searchParams.get("message");

    // postId es opcional: la conversación puede no estar ligada a una publicación.
    if (compose !== "1" || !sellerId || !message || !idUsuarioActual) {
      return;
    }

    if (inicioConversacionEjecutado.current) {
      return;
    }
    inicioConversacionEjecutado.current = true;

    const postId = searchParams.get("postId");
    const idPublicacion = postId && Number.isInteger(Number(postId)) && Number(postId) > 0 ? Number(postId): undefined;

    conversacionService.iniciarConversacion(Number(sellerId), message, idEstadoPendiente, idPublicacion)
      .then(({ conversacion }) => {
        setConversacionesState((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.id_conversacion === conversacion.id_conversacion
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = conversacion;
            return updated;
          }
          return [conversacion, ...prev];
        });

        setSelectedId(conversacion.id_conversacion);
        setMostrarChatMovil(true);

        // Evita reenviar el mensaje al refrescar.
        inicioConversacionEjecutado.current = false;
        router.replace(pathname);
      })
      .catch((err) => {
        inicioConversacionEjecutado.current = false;
        const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
        agregarNotificacion({ tipo: "error", mensaje });
        router.replace(pathname);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, idUsuarioActual, idEstadoPendiente]);

  const conversaciones = useMemo(() => {
    return [...conversacionesState].sort((a, b) => {
      const prioridadSolicitudA = a.esSolicitud ? 1 : 0;
      const prioridadSolicitudB = b.esSolicitud ? 1 : 0;

      if (prioridadSolicitudA !== prioridadSolicitudB) {
        return prioridadSolicitudB - prioridadSolicitudA;
      }

      return obtenerPesoRecencia(b.fecha_ultimo_mensaje) - obtenerPesoRecencia(a.fecha_ultimo_mensaje);
    });
  }, [conversacionesState]);

  const selected =
    conversaciones.find((conversacion) => conversacion.id_conversacion === selectedId)
    ?? conversaciones[0]
    ?? null;

  const { mensajes, handleEnviar, handleEnviarImagen, eliminarMensajesDe } =
    useMensajesChat(selected, setConversacionesState);

  const {
    acuerdo,
    acuerdosPendientesPorConversacion,
    publicacionesDisponiblesParaAcuerdo,
    handleAceptarAcuerdo,
    handleRechazarAcuerdo,
    handleCompletarAcuerdo,
    handleAbrirCrearEncuentro,
    handleSeleccionarPublicacion,
    handleEnviarSolicitud,
    modalSolicitudAbierto,
    modalSeleccionPublicacionAbierto,
    cerrarModalSeleccionPublicacion,
    cerrarModalSolicitud,
    publicacionSeleccionada,
    acuerdoEditando,
    enviandoSolicitud,
  } = useAcuerdosChat(conversacionesState, selected, setConversacionesState);

  useEffect(() => {
    const actualizarConversaciones = async () => {
      try {
        const conversacionesActualizadas =
          await conversacionService.listar(idEstadoPendiente);

        setConversacionesState(conversacionesActualizadas);
      } catch {
        // Si falla la actualización por socket, se conserva el estado actual.
      }
    };

    socket.on("conversacion:actualizada", actualizarConversaciones);

    return () => {
      socket.off("conversacion:actualizada", actualizarConversaciones);
    };
  }, [socket, idEstadoPendiente]);

  // Acepta una solicitud de conversación.
  const handleConfirmar = async (id: number) => {
    const idEstadoActivo = estadosConversacion.find((e) => e.estado === "activo")?.id_estado;
    if (!idEstadoActivo) return;
    try {
      await conversacionService.actualizarEstado(id, idEstadoActivo);
      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === id
          ? { ...conversacion, esSolicitud: false, estado_conversacion: idEstadoActivo, fecha_ultimo_mensaje: conversacion.fecha_ultimo_mensaje ?? obtenerHoraActual() }
          : conversacion
      )));
    } catch (err) {
      const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
      agregarNotificacion({ tipo: "error", mensaje });
    }
  };

  const handleEliminar = async (id: number) => {
    const idEstadoInactivo = estadosConversacion.find((e) => e.estado === "inactivo")?.id_estado;
    if (!idEstadoInactivo) return;
    try {
      await conversacionService.actualizarEstado(id, idEstadoInactivo);
      setConversacionesState((prev) => prev.filter((conversacion) => conversacion.id_conversacion !== id));
      eliminarMensajesDe(id);
      if (selectedId === id) {
        setSelectedId(null);
        setMostrarChatMovil(false);
      }
    } catch (err) {
      const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
      agregarNotificacion({ tipo: "error", mensaje });
    }
  };

  return (
    <div className={`mensajes-page${mostrarChatMovil ? " mensajes-page--chat-open" : ""}`}>
      <ChatSidebar
        conversaciones={conversaciones}
        selectedId={selected?.id_conversacion ?? null}
        onSelect={(conversacion) => {
          setSelectedId(conversacion.id_conversacion);
          setMostrarChatMovil(true);
        }}
        onConfirmar={handleConfirmar}
        onEliminar={handleEliminar}
        acuerdosPendientesPorConversacion={acuerdosPendientesPorConversacion}
      />

      {selected ? (
        <ChatPrincipal
          conversacion={selected}
          mensajes={mensajes}
          acuerdo={acuerdo}
          onEnviar={handleEnviar}
          onEnviarImagen={handleEnviarImagen}
          onAceptarAcuerdo={() => handleAceptarAcuerdo(selected.id_conversacion)}
          onRechazarAcuerdo={() => handleRechazarAcuerdo(selected.id_conversacion)}
          onCompletarAcuerdo={handleCompletarAcuerdo}
          onVerPerfil={(idUsuario) => {router.push(`/perfil/${idUsuario}?modo=vendedor`);}}
          onEnviarNuevaPropuesta={handleAbrirCrearEncuentro}
          onCrearEncuentro={handleAbrirCrearEncuentro}
          onVolver={() => setMostrarChatMovil(false)}
          puedeEnviarMensajes={idEstadoActivo != null && selected.estado_conversacion === idEstadoActivo}
        />
      ) : (
        <div className="mensajes-page__empty">
          {t("empty.selectConversation")}
        </div>
      )}

      {modalSeleccionPublicacionAbierto && (
        <SeleccionPublicacionModal
          isOpen={modalSeleccionPublicacionAbierto}
          publicaciones={publicacionesDisponiblesParaAcuerdo}
          onClose={cerrarModalSeleccionPublicacion}
          onSelect={handleSeleccionarPublicacion}
        />
      )}

      {modalSolicitudAbierto && publicacionSeleccionada && (
        <SolicitudAcuerdoModal
          isOpen={modalSolicitudAbierto}
          publicacion={publicacionSeleccionada}
          acuerdoInicial={acuerdoEditando}
          onClose={cerrarModalSolicitud}
          onSubmit={handleEnviarSolicitud}
          isSaving={enviandoSolicitud}
        />
      )}
    </div>
  );
}
