import type { SolicitudTutoriaNotificacion } from "../components/ui/Modal/NotificacionModal/Solicitud/Tutoria/TutoriaNotificacion";

export const MOCK_SOLICITUDES_TUTORIA = [
  {
    id: 201,
    alumno: "Sofía Morales",
    tutoria: "Cálculo diferencial",
    fecha: "30/07/2026",
    hora: "15:30",
    lugar: "Biblioteca central",
    tema: "Regla de la cadena y problemas de optimización.",
  },
  {
    id: 202,
    alumno: "Diego Herrera",
    tutoria: "Programación en Python",
    fecha: "01/08/2026",
    hora: "10:00",
    lugar: "Google Meet",
    tema: "Listas, diccionarios y resolución de ejercicios.",
  },
] satisfies SolicitudTutoriaNotificacion[];
