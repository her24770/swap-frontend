import type { Tag } from "./tag";
import type { Contact } from "./comment";
import type { UsuarioEtiquetaRel } from "../lib/tags";
import type { Resena } from "./resena";

export interface UserProfileData {
  id_usuario: number;
  name: string;
  description: string;
  imageUrl?: string;
  rating: number;
  totalReviews: number;
  contacts: Contact[];
  tags?: Tag[];
  paymentMethod?: string;
  calificacion?: number;
}

// Campos que el usuario puede editar desde el modal de perfil
export interface UserProfileEditData {
  name: string;
  description: string;
  imageUrl?: string;
  paymentMethod?: string;
  contacts?: {
    tipo_contacto: string;
    valor: string;
  }[];
}

export interface PerfilPublicoApi {
  id_usuario: number;
  nombre: string;
  descripcion: string | null;
  url_foto_perfil?: string;
  calificacion: number;
  metodo_pago?: string;
  contactos?: unknown[];
  etiquetas?: UsuarioEtiquetaRel[];
}

