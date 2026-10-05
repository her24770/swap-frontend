"use client";

import type { Tag } from "../../../types/tag";
import { isParentTag } from "../../../lib/tags";
import "./TagBadge.css";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md" | "lg";
  onClick?: (tag: Tag) => void;
}

export default function TagBadge({ tag, size = "md", onClick }: TagBadgeProps) {
  const variant = isParentTag(tag) ? "parent" : "child";

  const sizeClass =
    size === "sm" ? "tag-badge--sm" : size === "lg" ? "tag-badge--lg" : "";

  const clickableClass = onClick ? "tag-badge--clickable" : "";

  return (
    <span
      className={`tag-badge tag-badge--${variant} ${sizeClass} ${clickableClass}`.trim()}
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
