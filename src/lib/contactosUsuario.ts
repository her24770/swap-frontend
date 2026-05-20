import { apiClient } from "./apiClient";
import type { Contact } from "../types/comment";

/*Mapeo de tipos de contacto con sus id. */
export const TIPO_CONTACTO_ID = {
  telefono: 1,
  whatsapp: 2,
  instagram: 3,
  correo_personal: 4,
} as const;

export type ContactPlatform = keyof typeof TIPO_CONTACTO_ID;

const ID_TO_PLATFORM = Object.fromEntries(
  Object.entries(TIPO_CONTACTO_ID).map(([k, v]) => [v, k])
) as Record<number, ContactPlatform>;

export function platformFromTipoContactoId(
  id: number
): Contact["platform"] | null {
  const p = ID_TO_PLATFORM[id];
  return p ?? null;
}

export function tipoContactoIdFromPlatform(
  platform: string
): number | null {
  if (platform in TIPO_CONTACTO_ID) {
    return TIPO_CONTACTO_ID[platform as ContactPlatform];
  }
  return null;
}

export interface ContactoUpsertBody {
  valor: string;
  tipo_contacto: number;
}

export function contactosToUpsertBody(
  rows: { type: string; value: string }[]
): ContactoUpsertBody[] {
  const out: ContactoUpsertBody[] = [];
  for (const c of rows) {
    const trimmed = c.value.trim();
    if (!c.type || !trimmed) continue;
    const idTipo = tipoContactoIdFromPlatform(c.type);
    if (idTipo == null) continue;
    out.push({ valor: trimmed, tipo_contacto: idTipo });
  }
  return out;
}

function readTipoContactoId(raw: Record<string, unknown>): number | null {
  if (typeof raw.tipo_contacto === "number" && !Number.isNaN(raw.tipo_contacto)) {
    return raw.tipo_contacto;
  }
  const nested = raw.tipoContacto ?? raw.tipo_contacto;
  if (nested && typeof nested === "object" && nested !== null) {
    const o = nested as Record<string, unknown>;
    const id =
      o.id_tipo_contacto ?? o.idTipoContacto ?? o.id;
    if (typeof id === "number" && !Number.isNaN(id)) return id;
  }
  if (typeof raw.id_tipo_contacto === "number") return raw.id_tipo_contacto;
  return null;
}

/**
 * Normalizacion del para uso como contact[] 
 */
export function mapApiContactosToContacts(
  data: unknown
): Contact[] {
  if (data && typeof data === "object" && "data" in data) {
    return mapApiContactosToContacts((data as { data?: unknown }).data);
  }

  if (!Array.isArray(data)) return [];
  const contacts: Contact[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const valor = typeof o.valor === "string" ? o.valor : "";
    const tipoId = readTipoContactoId(o);
    if (tipoId == null || !valor) continue;
    const platform = platformFromTipoContactoId(tipoId);
    if (!platform) continue;
    contacts.push({ platform, url: valor });
  }
  return contacts;
}

export async function obtenerContactosUsuario(
  idUsuario: number
): Promise<Contact[]> {
  const raw = await apiClient.get<unknown>(
    `/api/user/${idUsuario}/contactos`
  );
  return mapApiContactosToContacts(raw);
}

export async function reemplazarContactosUsuario(
  idUsuario: number,
  contactos: ContactoUpsertBody[]
): Promise<void> {
  await apiClient.put(`/api/user/${idUsuario}/contactos`, {
    contactos,
  });
}
