"use client";

import { useState } from "react";
import Image from "next/image";
import "./Avatar.css";

interface AvatarProps {
  src?: string | null;
  name: string;
  alt?: string;
  size?: number;
  fill?: boolean;
  className?: string;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Muestra la foto de perfil y, si no hay foto o falla al cargar, las iniciales del usuario.
export default function Avatar({ src, name, alt, size = 40, fill = false, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  if (!showImage) {
    return (
      <span
        className="avatar-initials"
        style={{ fontSize: `${Math.max(size * 0.4, 10)}px` }}
        aria-label={alt ?? name}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt ?? name}
      {...(fill ? { fill: true } : { width: size, height: size })}
      className={className}
      unoptimized
      onError={() => setFailedSrc(src as string)}
    />
  );
}
