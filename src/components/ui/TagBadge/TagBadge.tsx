"use client";

import type { Tag } from "../../../types/tag";
import { getTagColor, getTagColorByKey } from "../../../lib/tagColors";
import "./TagBadge.css";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md" | "lg";
  onClick?: (tag: Tag) => void;
}

/**
 * TagBadge — componente unificado de etiquetas.
 *
 * Soporta dos modos de color:
 *  1. Por jerarquía (parentId + depth): los hijos heredan la escala
 *     de color de su padre, con tonos más claros a mayor profundidad.
 *  2. Por colorKey legacy (string): compatibilidad con el sistema antiguo
 *     usado en perfiles (ej. "assembler", "electronica").
 *
 * Si se proveen ambos, prevalece la jerarquía (parentId).
 */
export default function TagBadge({ tag, size = "md", onClick }: TagBadgeProps) {
  const depth = tag.depth ?? 0;

  const color =
    tag.parentId !== undefined
      ? getTagColor(tag.id, tag.parentId, depth)
      : tag.colorKey
      ? getTagColorByKey(tag.colorKey, depth)
      : getTagColor(tag.id, null, depth);

  const sizeClass =
    size === "sm" ? "tag-badge--sm" : size === "lg" ? "tag-badge--lg" : "";

  const clickableClass = onClick ? "tag-badge--clickable" : "";

  return (
    <span
      className={`tag-badge ${sizeClass} ${clickableClass}`.trim()}
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.border,
      }}
      onClick={onClick ? () => onClick(tag) : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(tag);
              }
            }
          : undefined
      }
    >
      {tag.name}
    </span>
  );
}