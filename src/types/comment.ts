export interface Comment {
  id: string;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface Contact {
  platform: "instagram" | "whatsapp" | "linkedin" | "facebook";
  url: string;
}
