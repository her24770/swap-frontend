import type { Tag } from "./tag";
import type { Contact } from "./comment";

export interface UserProfileData {
  name: string;
  description: string;
  imageUrl?: string;
  rating: number;
  totalReviews: number;
  contacts: Contact[];
  tags?: Tag[];
  paymentMethod?: string;
}

// Campos que el usuario puede editar desde el modal de perfil
export interface UserProfileEditData {
  name: string;
  description: string;
  imageUrl?: string;
  paymentMethod?: string;
}
