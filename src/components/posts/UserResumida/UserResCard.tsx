"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Avatar from "../../ui/Avatar/Avatar";
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
        <Avatar
          src={userImageUrl}
          name={userName}
          size={48}
          fill
          className="user-res-card__avatar-img img-cover"
        />
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