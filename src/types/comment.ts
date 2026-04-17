export interface Comment {
  id: string;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface Contact {
  platform: "telefono" | "whatsapp" | "instagram" | "correo_personal";
  url: string;
}
