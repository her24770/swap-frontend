/**
 * Utilidades genéricas para formateo y manipulación de fechas.
 */

export interface FormatoFechaHora {
  fecha: string;
  hora: string;
}

/**
 * Formatea una fecha ISO o string a fecha (DD/MM/YYYY) y hora (HH:mm).
 */
export function formatDateTime(fechaStr: string | Date | null | undefined): FormatoFechaHora {
  if (!fechaStr) {
    return { fecha: "Sin fecha", hora: "Sin hora" };
  }

  try {
    const d = typeof fechaStr === "string" ? new Date(fechaStr) : fechaStr;
    if (isNaN(d.getTime())) {
      return { fecha: typeof fechaStr === "string" ? fechaStr : "Sin fecha", hora: "Sin hora" };
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const fecha = `${day}/${month}/${year}`;

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const hora = `${hours}:${minutes}`;

    return { fecha, hora };
  } catch {
    return { fecha: typeof fechaStr === "string" ? fechaStr : "Sin fecha", hora: "Sin hora" };
  }
}
