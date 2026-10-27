import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import type {
  PublicacionAcuerdo,
  SolicitudAcuerdoFormData,
} from "../components/ui/Modal/SolicitudAcuerdo/SolicitudAcuerdoModal";
import { acuerdoService } from "../services/acuerdoService";
import { useSocket } from "./useSocket";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import type { AcuerdoHistorial } from "../types/acuerdo";
import type { ConversacionPreview } from "../types/chat";

// Acuerdos de las conversaciones del chat: carga, respuesta (aceptar/rechazar/
// completar), creacion/edicion de solicitudes y estado de sus modales.
export function useAcuerdosChat(
  conversacionesState: ConversacionPreview[],
  selected: ConversacionPreview | null,
  setConversacionesState: Dispatch<SetStateAction<ConversacionPreview[]>>
) {
  const t = useTranslations("chat");
  const { agregarNotificacion } = useUIStore();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const socket = useSocket();
  // id_conversacion -> lista de acuerdos
  const [acuerdosPorConversacion, setAcuerdosPorConversacion] =
    useState<Record<number, AcuerdoHistorial[]>>({});
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  const [modalSeleccionPublicacionAbierto, setModalSeleccionPublicacionAbierto] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<PublicacionAcuerdo | null>(null);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [acuerdoEditando, setAcuerdoEditando] = useState<AcuerdoHistorial | null>(null);

  const cargarAcuerdosDeConversacion = useCallback(async (idConversacion: number) => {
    try {
      const data = await acuerdoService.getPorConversacion(idConversacion);
      setAcuerdosPorConversacion((prev) => ({ ...prev, [idConversacion]: data }));
    } catch {
      // Conversacion sin acuerdos todavia.
      setAcuerdosPorConversacion((prev) => ({ ...prev, [idConversacion]: [] }));
    }
  }, []);

  // Necesarios para el badge de acuerdo pendiente en la lista.
  useEffect(() => {
    conversacionesState.forEach((conversacion) => {
      cargarAcuerdosDeConversacion(conversacion.id_conversacion);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversacionesState.map((c) => c.id_conversacion).join(","), cargarAcuerdosDeConversacion]);

  // Refresca los acuerdos de la conversación afectada.
  useEffect(() => {
    const actualizarAcuerdo = (payload: { id_conversacion?: number }) => {
      const idConversacion = Number(payload?.id_conversacion);

      if (!Number.isInteger(idConversacion) || idConversacion <= 0) {
        return;
      }

      cargarAcuerdosDeConversacion(idConversacion);
    };

    socket.on("acuerdo:actualizado", actualizarAcuerdo);

    return () => {
      socket.off("acuerdo:actualizado", actualizarAcuerdo);
    };
  }, [socket, cargarAcuerdosDeConversacion]);

  const acuerdosPendientesPorConversacion = useMemo(() => {
    const mapa: Record<number, number> = {};
    for (const [id, acuerdos] of Object.entries(acuerdosPorConversacion)) {
      mapa[Number(id)] = acuerdos.filter((a) => a.estadoRel?.estado === "pendiente").length;
    }
    return mapa;
  }, [acuerdosPorConversacion]);

  const acuerdosSeleccionados = selected
    ? acuerdosPorConversacion[selected.id_conversacion] ?? []
    : [];

  // Para el banner: prioriza el acuerdo activo; si no hay, el pendiente mas reciente
  const acuerdo =
    acuerdosSeleccionados.find((a) => a.estadoRel?.estado === "activo")
    ?? acuerdosSeleccionados.find((a) => a.estadoRel?.estado === "pendiente")
    ?? null;

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

  const handleCompletarAcuerdo = () => {
    if (acuerdo && selected) responderAcuerdo(selected.id_conversacion, acuerdo.id_acuerdo, "completado");
  };

  // En modo edición hace la contraoferta sobre el acuerdo existente.
  const handleEnviarSolicitud = async (data: SolicitudAcuerdoFormData) => {
    if (!selected) return;
    setEnviandoSolicitud(true);
    try {
      if (modoEdicion && acuerdoEditando) {
        await acuerdoService.editarSolicitud(acuerdoEditando.id_acuerdo, {
          fecha_entrega: data.fecha_entrega,
          lugar_entrega: data.lugar_entrega,
          observaciones: data.observaciones,
        });
      } else {
        await acuerdoService.crearSolicitud(data.id_publicacion, {
          fecha_entrega: data.fecha_entrega,
          lugar_entrega: data.lugar_entrega,
          observaciones: data.observaciones,
          id_conversacion: selected.id_conversacion,
        });
      }

      cerrarModalSolicitud();

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

  const cerrarModalSolicitud = () => {
    setModalSolicitudAbierto(false);
    setModoEdicion(false);
    setAcuerdoEditando(null);
    setPublicacionSeleccionada(null);
  };

  const contextosDisponiblesParaAcuerdo = useMemo(() => {
    if (!selected || !idUsuarioActual) return [];

    return (selected.contextos ?? []).filter(
      (contexto) =>
        contexto.publicacion.id_usuario !== idUsuarioActual
    );
  }, [selected, idUsuarioActual]);

  const publicacionesDisponiblesParaAcuerdo = useMemo<PublicacionAcuerdo[]>(() =>
    contextosDisponiblesParaAcuerdo.map((contexto) => ({
      id_publicacion: contexto.publicacion.id_publicacion,
      titulo: contexto.publicacion.titulo,
      precio: Number(contexto.publicacion.precio),
    })),
    [contextosDisponiblesParaAcuerdo]
  );

  const handleAbrirCrearEncuentro = () => {
    // Contraoferta:
    // el acuerdo existente ya determina de forma inequívoca la publicación.
    if (acuerdo && acuerdo.estadoRel?.estado === "pendiente") {
      setModoEdicion(true);
      setAcuerdoEditando(acuerdo);

      setPublicacionSeleccionada({
        id_publicacion: acuerdo.publicacion.id_publicacion,
        titulo: acuerdo.publicacion.titulo,
        precio: Number(acuerdo.publicacion.precio),
      });

      setModalSolicitudAbierto(true);
      return;
    }

    // A partir de aquí estamos creando un acuerdo NUEVO.
    setModoEdicion(false);
    setAcuerdoEditando(null);

    if (publicacionesDisponiblesParaAcuerdo.length === 0) {
      agregarNotificacion({
        tipo: "info",
        mensaje: t("system.noPublicationForAgreement"),
      });
      return;
    }

    // Un único contexto: no tiene sentido obligar al usuario a seleccionarlo.
    if (publicacionesDisponiblesParaAcuerdo.length === 1) {
      setPublicacionSeleccionada(publicacionesDisponiblesParaAcuerdo[0]);
      setModalSolicitudAbierto(true);
      return;
    }

    // Varios contextos: el usuario decide explícitamente.
    setPublicacionSeleccionada(null);
    setModalSeleccionPublicacionAbierto(true);
  };

  const handleSeleccionarPublicacion = (publicacion: PublicacionAcuerdo) => {
    setPublicacionSeleccionada(publicacion);
    setModalSeleccionPublicacionAbierto(false);

    setModoEdicion(false);
    setAcuerdoEditando(null);

    setModalSolicitudAbierto(true);
  };

  return {
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
    cerrarModalSeleccionPublicacion: () => setModalSeleccionPublicacionAbierto(false),
    cerrarModalSolicitud,
    publicacionSeleccionada,
    acuerdoEditando,
    enviandoSolicitud,
  };
}
