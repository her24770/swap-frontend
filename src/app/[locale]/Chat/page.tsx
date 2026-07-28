"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ChatPrincipal from "../../../components/Chat/ChatPrincipal/ChatPrincipal";
import ChatSidebar from "../../../components/Chat/ChatSidebar/chatsidebar";
import SolicitudAcuerdoModal, {
  PublicacionAcuerdo,
  type SolicitudAcuerdoFormData,
} from "../../../components/ui/Modal/SolicitudAcuerdo/SolicitudAcuerdoModal";
import { acuerdoService } from "../../../services/acuerdoService";
import { conversacionService } from "../../../services/conversacionService";
import { useEstados } from "../../../hooks/useEstados";
import { useSocket, unirseAConversacion, enviarMensajePorSocket } from "../../../hooks/useSocket";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import type { AcuerdoHistorial } from "../../../types/acuerdo";
import type { ConversacionPreview, Mensaje, PublicacionChatResumen, TabMensajes } from "../../../types/chat";
import { useConversacionPublicacionStore } from "../../../store/conversacionPublicacionStore";
import "./ChatPage.css";
import { publicacionService } from "../../../services/publicacionService";

// NOTA: no hay (todavia) una regla real de negocio para distinguir conversaciones
// de "ventas" vs "compras" (ningun ticket del sprint la define), asi que los tabs
// "ventas"/"compras" quedan sin filtrar (muestran lo mismo que "todas") hasta que
// se defina esa regla, en vez de mostrar listas vacias con datos reales.
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
  const { agregarNotificacion } = useUIStore();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // "conversacion" trae "activo", "inactivo" y "pendiente" (necesarios para
  // aceptar/bloquear solicitudes y para saber si una conversacion es una solicitud).
  const estadosConversacion = useEstados("conversacion");
  const idEstadoPendiente = estadosConversacion.find((e) => e.estado === "pendiente")?.id_estado;
  const [tab, setTab] = useState<TabMensajes>("todas");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mostrarChatMovil, setMostrarChatMovil] = useState(false);
  const [conversacionesState, setConversacionesState] =
    useState<ConversacionPreview[]>([]);
    // Acuerdos reales por conversacion (ST-H22-4): id_conversacion -> lista de acuerdos
    const [acuerdosPorConversacion, setAcuerdosPorConversacion] =
    useState<Record<number, AcuerdoHistorial[]>>({});
  const [mensajesPorConversacion, setMensajesPorConversacion] =
    useState<Record<number, Mensaje[]>>({});
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [acuerdoEditando, setAcuerdoEditando] = useState<AcuerdoHistorial | null>(null);
  const inicioConversacionEjecutado = useRef(false);
  // Relacionar conversacion con publicacion con persistencia en Zustand
  const guardarRelacion = useConversacionPublicacionStore((state) => state.guardarRelacion)
  const obtenerPublicacion = useConversacionPublicacionStore((state) => state.obtenerPublicacion);
  const [publicacionGuardada, setPublicacionGuardada] = useState< PublicacionAcuerdo| null>(null);

  // Carga el listado real de conversaciones del usuario (GET /api/conversacion/conversaciones,
  // ST-H44-1/SWAP-338). Espera a que los estados esten disponibles para poder marcar
  // correctamente cuales son "solicitud" (esSolicitud depende de idEstadoPendiente).
  useEffect(() => {
    if (!idUsuarioActual || estadosConversacion.length === 0) return;
    conversacionService.listar(idEstadoPendiente)
      .then(setConversacionesState)
      .catch(() => {
        agregarNotificacion({ tipo: "error", mensaje: t("system.agreementActionError") });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuarioActual, estadosConversacion.length, idEstadoPendiente]);

  // Trae los acuerdos reales de una conversacion (GET /api/acuerdo/conversacion/:id, ST-H44-3)
  const cargarAcuerdosDeConversacion = useCallback(async (idConversacion: number) => {
    try {
      const data = await acuerdoService.getPorConversacion(idConversacion);
      setAcuerdosPorConversacion((prev) => ({ ...prev, [idConversacion]: data }));
    } catch {
      // Conversacion sin acuerdos todavia.
      setAcuerdosPorConversacion((prev) => ({ ...prev, [idConversacion]: [] }));
    }
  }, []);

  // Carga los acuerdos de todas las conversaciones visibles, para poder mostrar
  // el badge de "acuerdo pendiente" (ST-H22-2) en la lista del chat.
  useEffect(() => {
    conversacionesState.forEach((conversacion) => {
      cargarAcuerdosDeConversacion(conversacion.id_conversacion);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversacionesState.map((c) => c.id_conversacion).join(","), cargarAcuerdosDeConversacion]);

  // Atiende el "Contactar"/"Enviar mensaje" que llega desde el perfil de otro
  // usuario como query params (?compose=1&sellerId=X&message=...). En vez de
  // fabricar una conversacion sintetica solo en memoria, llama al backend real
  // (POST /api/conversacion, SWAP-337/SWAP-339): crea la conversacion si no
  // existe (o la reutiliza) y guarda el mensaje de verdad.
  useEffect(() => {
    const compose = searchParams.get("compose");
    const sellerId = searchParams.get("sellerId");
    const message = searchParams.get("message");

    // postId es opcional: permite iniciar una conversacion directa con un
    // usuario (p.ej. desde su perfil) sin que este ligada a una publicacion.
    if (compose !== "1" || !sellerId || !message || !idUsuarioActual) {
      return;
    }

    if (inicioConversacionEjecutado.current) {
      return;
    }
    inicioConversacionEjecutado.current = true;

    const postId = searchParams.get("postId");
    const postTitle = searchParams.get("postTitle");
    const postPrice = searchParams.get("postPrice");
    const postDescription = searchParams.get("postDescription");
    const postImageUrl = searchParams.get("postImageUrl");
    const postType = searchParams.get("postType");
    const recipient = searchParams.get("recipient");

    const publicacion: PublicacionChatResumen | undefined = postId
      ? {
        id: Number(postId),
        titulo: postTitle || recipient || "",
        precio: postPrice ? parseFloat(postPrice) : 0,
        descripcion: postDescription || undefined,
        imagenUrl: postImageUrl || undefined,
        tipo: (postType as PublicacionChatResumen["tipo"]) || "venta",
      }
      : undefined;
      
      conversacionService.iniciarConversacion(Number(sellerId), message, idEstadoPendiente)
      .then(({ conversacion }) => {
        const conversacionConPublicacion = publicacion
          ? { ...conversacion, publicacion }
          : conversacion;

        if (publicacion) {
          guardarRelacion(
            conversacion.id_conversacion,
            publicacion.id
          );
        }

        setConversacionesState((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.id_conversacion === conversacion.id_conversacion
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = conversacionConPublicacion;
            return updated;
          }
          return [conversacionConPublicacion, ...prev];
        });

        setSelectedId(conversacion.id_conversacion);
        setMostrarChatMovil(true);

        // Limpia los query params para que un refresh no vuelva a enviar el mensaje.
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
    // Los tabs "ventas"/"compras" no filtran todavia: no hay una regla real de
    // negocio para derivarlos de los datos de conversacion (ver nota arriba).
    const conversacionesFiltradas = conversacionesState;

    return [...conversacionesFiltradas].sort((a, b) => {
      const prioridadSolicitudA = a.esSolicitud ? 1 : 0;
      const prioridadSolicitudB = b.esSolicitud ? 1 : 0;

      if (prioridadSolicitudA !== prioridadSolicitudB) {
        return prioridadSolicitudB - prioridadSolicitudA;
      }

      return obtenerPesoRecencia(b.fecha_ultimo_mensaje) - obtenerPesoRecencia(a.fecha_ultimo_mensaje);
    });
  }, [conversacionesState, tab]);

  const acuerdosPendientesPorConversacion = useMemo(() => {
    const mapa: Record<number, number> = {};
    for (const [id, acuerdos] of Object.entries(acuerdosPorConversacion)) {
      mapa[Number(id)] = acuerdos.filter((a) => a.estadoRel?.estado === "pendiente").length;
    }
    return mapa;
  }, [acuerdosPorConversacion]);

  const selected =
    conversaciones.find((conversacion) => conversacion.id_conversacion === selectedId)
    ?? conversaciones[0]
    ?? null;

  // Carga el historial real de mensajes de la conversacion seleccionada
  // (GET /api/conversacion/:id/mensajes, ST-H44-2/ST-H44-9/SWAP-336/SWAP-338)
  // y se une a la sala de socket de esa conversacion (SWAP-332).
  useEffect(() => {
    if (!selected) return;
    let cancelado = false;
    conversacionService.obtenerMensajes(selected.id_conversacion)
      .then((mensajesConversacion) => {
        if (cancelado) return;
        setMensajesPorConversacion((prev) => ({
          ...prev,
          [selected.id_conversacion]: mensajesConversacion,
        }));
      })
      .catch(() => {});
    unirseAConversacion(socket, selected.id_conversacion).catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [selected?.id_conversacion, socket]);

  // Escucha "mensaje:nuevo" para todas las conversaciones (SWAP-333): actualiza el
  // historial de la conversacion correspondiente y el preview en el sidebar, sin
  // necesidad de refrescar. El propio emisor tambien recibe este evento (esta unido
  // a la sala), asi que es la unica fuente de verdad: no se hace append local optimista.
  useEffect(() => {
    function alRecibirMensaje(mensajeNuevo: Mensaje) {
      setMensajesPorConversacion((prev) => {
        const actuales = prev[mensajeNuevo.id_conversacion] ?? [];
        if (actuales.some((m) => m.id_mensaje === mensajeNuevo.id_mensaje)) return prev;
        return {
          ...prev,
          [mensajeNuevo.id_conversacion]: [...actuales, mensajeNuevo],
        };
      });
      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === mensajeNuevo.id_conversacion
          ? {
            ...conversacion,
            preview: mensajeNuevo.mensaje,
            fecha_ultimo_mensaje: new Date(mensajeNuevo.fecha_enviado).toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
          : conversacion
      )));
    }

    socket.on("mensaje:nuevo", alRecibirMensaje);
    return () => {
      socket.off("mensaje:nuevo", alRecibirMensaje);
    };
  }, [socket]);

  const mensajes = selected
    ? mensajesPorConversacion[selected.id_conversacion] ?? []
    : [];

  const acuerdosSeleccionados = selected
    ? acuerdosPorConversacion[selected.id_conversacion] ?? []
    : [];

  // Para el banner: prioriza el acuerdo activo; si no hay, el pendiente mas reciente
  const acuerdo =
    acuerdosSeleccionados.find((a) => a.estadoRel?.estado === "activo")
    ?? acuerdosSeleccionados.find((a) => a.estadoRel?.estado === "pendiente")
    ?? null;

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

  // Envia el mensaje por socket (SWAP-333); el propio "mensaje:nuevo" que
  // devuelve el backend (listener de arriba) es el que actualiza el estado,
  // no un append local optimista.
  const handleEnviar = async (texto: string) => {
    if (!selected || !idUsuarioActual) return;

    const respuesta = await enviarMensajePorSocket(socket, selected.id_conversacion, texto);
    if (!respuesta.success) {
      agregarNotificacion({
        tipo: "error",
        mensaje: respuesta.message ?? t("system.agreementActionError"),
      });
    }
  };

  const handleEnviarImagen = (archivo: File) => {
    if (!selected || !idUsuarioActual) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: selected.id_conversacion,
      id_emisor: idUsuarioActual,
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

  // Acepta o bloquea una solicitud de conversacion (PUT /api/conversacion/:id/estado, ST-H44-4/ST-H44-11)
  const handleConfirmar = async (id: number) => {
    const idEstadoActivo = estadosConversacion.find((e) => e.estado === "activo")?.id_estado;
    if (!idEstadoActivo) return;
    try {
      await conversacionService.actualizarEstado(id, idEstadoActivo);
      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === id
          ? { ...conversacion, esSolicitud: false, fecha_ultimo_mensaje: conversacion.fecha_ultimo_mensaje ?? obtenerHoraActual() }
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
      setMensajesPorConversacion((prev) => {
        const actualizado = { ...prev };
        delete actualizado[id];
        return actualizado;
      });
      if (selectedId === id) {
        setSelectedId(null);
        setMostrarChatMovil(false);
      }
    } catch (err) {
      const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
      agregarNotificacion({ tipo: "error", mensaje });
    }
  };

  // Responde una solicitud de acuerdo pendiente contra PUT /api/acuerdo/:id (ST-H36-6)
  const responderAcuerdo = async (
    idConversacion: number,
    idAcuerdo: number,
    estado: "activo" | "cancelado" | "completado"
  ) => {
    try {
      await acuerdoService.actualizarEstado(idAcuerdo, estado);
      await cargarAcuerdosDeConversacion(idConversacion);

      const mensajeSistema =
        estado === "activo" ? t("system.agreementAccepted")
        : estado === "cancelado" ? t("system.agreementRejected")
        : t("system.agreementCompleted");

      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === idConversacion
          ? { ...conversacion, preview: mensajeSistema }
          : conversacion
      )));
    } catch (err) {
      const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
      agregarNotificacion({ tipo: "error", mensaje });
    }
  };

  const handleAceptarAcuerdo = (idConversacion: number) => {
    const acuerdoPendiente = (acuerdosPorConversacion[idConversacion] ?? [])
      .find((a) => a.estadoRel?.estado === "pendiente");
    if (!acuerdoPendiente) return;
    responderAcuerdo(idConversacion, acuerdoPendiente.id_acuerdo, "activo");
  };

  const handleRechazarAcuerdo = (idConversacion: number) => {
    const acuerdoPendiente = (acuerdosPorConversacion[idConversacion] ?? [])
      .find((a) => a.estadoRel?.estado === "pendiente");
    if (!acuerdoPendiente) return;
    responderAcuerdo(idConversacion, acuerdoPendiente.id_acuerdo, "cancelado");
  };

  // Crea una nueva solicitud de acuerdo (POST /api/acuerdo/:idPublicacion, ST-H36-6).
  // Reutiliza la publicacion del acuerdo mas reciente de la conversacion como
  // "objeto" del acuerdo, ya que la conversacion en si no guarda una publicacion
  // asociada (una misma conversacion puede tener varias solicitudes en el tiempo).
  const handleEnviarSolicitud = async (data: SolicitudAcuerdoFormData) => {
    if (!selected) return;
    setEnviandoSolicitud(true);
    try {
      if(modoEdicion && acuerdoEditando){
          await acuerdoService.editarSolicitud(acuerdoEditando.id_acuerdo, {
          fecha_entrega: data.fecha_entrega,
          lugar_entrega: data.lugar_entrega,
          observaciones: data.observaciones,
        });
      } else{
        await acuerdoService.crearSolicitud(data.id_publicacion, {
          fecha_entrega: data.fecha_entrega,
          lugar_entrega: data.lugar_entrega,
          observaciones: data.observaciones,
          id_conversacion: selected.id_conversacion,
        });
      }
      
      setModalSolicitudAbierto(false);
      setModoEdicion(false);
      setAcuerdoEditando(null);
      setPublicacionGuardada(null);

      await cargarAcuerdosDeConversacion(selected.id_conversacion);
      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === selected.id_conversacion
          ? { ...conversacion, preview: t("system.newAgreementProposalSent") }
          : conversacion
      )));
    } catch (err) {
      const mensaje = (err as { message?: string })?.message ?? t("system.agreementActionError");
      agregarNotificacion({ tipo: "error", mensaje });
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const publicacionParaNuevaSolicitud = useMemo(() => {
    if (selected?.publicacion) {
      return {
          id_publicacion: selected.publicacion.id,
          titulo: selected.publicacion.titulo,
          precio: selected.publicacion.precio,
      };
    }

    const ultimoAcuerdo = acuerdosSeleccionados[0];
    if (!ultimoAcuerdo) return null;
    return {
      id_publicacion: ultimoAcuerdo.publicacion.id_publicacion,
      titulo: ultimoAcuerdo.publicacion.titulo,
      precio: ultimoAcuerdo.publicacion.precio,
    };
  }, [acuerdosSeleccionados]);

  const handleAbrirCrearEncuentro = async () => {
    if (!publicacionParaNuevaSolicitud) {
      const idPublicacion = selected
        ? obtenerPublicacion(selected.id_conversacion)
        : undefined;
      // No hay publicacion asociada a esta conversacion todavia: sin un
      // selector de publicacion (fuera del alcance de este sprint) no
      // podemos saber sobre que publicacion crear el acuerdo.
      if(!idPublicacion){
        agregarNotificacion({ tipo: "info", mensaje: t("system.noPublicationForAgreement") });
        return;
      }

      try {
        const publicacion = await publicacionService.getById(idPublicacion);
        setPublicacionGuardada({
          id_publicacion: publicacion.id_publicacion,
          titulo: publicacion.titulo,
          precio: publicacion.precio,
        });
      } catch {
        agregarNotificacion({
          tipo: "info",
          mensaje: t("system.noPublicationForAgreement"),
        });
        return;
      }
    }

    if (acuerdo && acuerdo.estadoRel?.estado === "pendiente") {
      setModoEdicion(true);
      setAcuerdoEditando(acuerdo);
    } else {
      setModoEdicion(false);
      setAcuerdoEditando(null);
    }

    setModalSolicitudAbierto(true);
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
        acuerdosPendientesPorConversacion={acuerdosPendientesPorConversacion}
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
          onCompletarAcuerdo={() => acuerdo && selected && responderAcuerdo(selected.id_conversacion, acuerdo.id_acuerdo, "completado")}
          onEnviarNuevaPropuesta={handleAbrirCrearEncuentro}
          onCrearEncuentro={handleAbrirCrearEncuentro}
          onVolver={() => setMostrarChatMovil(false)}
        />
      ) : (
        <div className="mensajes-page__empty">
          {t("empty.selectConversation")}
        </div>
      )}

      {modalSolicitudAbierto && (publicacionParaNuevaSolicitud || publicacionGuardada) && (
        <SolicitudAcuerdoModal
          isOpen={modalSolicitudAbierto}
          publicacion={publicacionParaNuevaSolicitud ?? publicacionGuardada!}
          acuerdoInicial={acuerdoEditando}
          onClose={() => {setModalSolicitudAbierto(false); setModoEdicion(false); setAcuerdoEditando(null); setPublicacionGuardada(null)}}
          onSubmit={handleEnviarSolicitud}
          isSaving={enviandoSolicitud}
        />
      )}
    </div>
  );
}