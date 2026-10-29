import { Pin, SquarePen, Trash2, Heart, Bookmark } from "lucide-react";
import type { Tag } from "../../../types/tag";

export interface CatalogPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
  tipo: string;
  categorias: number[];
  isPinned: boolean;
}

export const getPostCardInfoItems = (t: (key: string) => string) => [
  { icon: <Pin size={16} strokeWidth={2} />, label: t("hints.post.pin") },
  { icon: <SquarePen size={16} strokeWidth={2} />, label: t("hints.post.edit") },
  { icon: <Trash2 size={16} strokeWidth={2} />, label: t("hints.post.delete") },
  { icon: <Heart size={16} strokeWidth={2} />, label: t("hints.post.like") },
  { icon: <Bookmark size={16} strokeWidth={2} />, label: t("hints.post.save") },
];

export const getAdBannerInfoItems = (t: (key: string) => string) => [
  { icon: <SquarePen size={16} strokeWidth={2} />, label: t("hints.ad.edit") },
  { icon: <Trash2 size={16} strokeWidth={2} />, label: t("hints.ad.delete") },
];

export const postCardInfoItems = [
  { icon: <Pin size={16} strokeWidth={2} />, label: "Destacar: resalta la publicación en tu catálogo." },
  { icon: <SquarePen size={16} strokeWidth={2} />, label: "Editar: modifica los datos de la publicación." },
  { icon: <Trash2 size={16} strokeWidth={2} />, label: "Eliminar: la borra de forma permanente, pide confirmar antes." },
  { icon: <Heart size={16} strokeWidth={2} />, label: "Dar like: indica que la publicación te interesa." },
  { icon: <Bookmark size={16} strokeWidth={2} />, label: "Guardar: la agrega a tu lista de publicaciones guardadas." },
];

export const adBannerInfoItems = [
  { icon: <SquarePen size={16} strokeWidth={2} />, label: "Editar: modifica los datos del anuncio." },
  { icon: <Trash2 size={16} strokeWidth={2} />, label: "Eliminar: lo borra de forma permanente, pide confirmar antes." },
];
