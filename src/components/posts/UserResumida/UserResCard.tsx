"use client";

import Image from "next/image";
import { ChevronRight, UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import "../../ui/Button/Button.css";
import "./UserResCard.css";

interface UserResCardProps {
  userId?: number;
  userName: string;
  userRating: number;
  userImageUrl?: string;
  onDetallesClick?: () => void;
}

const MAX_STARS = 5;

export default function UserResCard({
  userId,
  userName,
  userRating,
  userImageUrl,
  onDetallesClick,
}: UserResCardProps) {
  const t = useTranslations("posts");

  return (
    <article className="user-res-card">
      {/* Avatar */}
      <div className="user-res-card__avatar">
        {userImageUrl ? (
          <Image
            src={userImageUrl}
            alt={userName}
            fill
            className="user-res-card__avatar-img"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <UserCircle2
            size={40}
            strokeWidth={1}
            className="user-res-card__avatar-placeholder"
          />
        )}
      </div>

      {/* Info */}
      <div className="user-res-card__content">
        <span className="user-res-card__name">{userName}</span>

        <div className="user-res-card__stars">
          {Array.from({ length: MAX_STARS }).map((_, i) => (
            <span
              key={i}
              className={`user-res-card__star${i < userRating ? " user-res-card__star--filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>

        <div className="user-res-card__footer">
          <button
            type="button"
            className="button button--small"
            onClick={onDetallesClick}
          >
            {t("actions.details")} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}