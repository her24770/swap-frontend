import {Star } from "lucide-react";
import "./CommentCard.css";

interface CommentCardProps {
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export default function CommentCard({ authorName, timeAgo, rating, comment }: CommentCardProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article className="comment-item">
      <div className="comment-item__header">
        <div className="comment-item__author">
          <div className="comment-item__avatar">{initials}</div>
          <div className="comment-item__author-info">
            <span className="comment-item__name">{authorName}</span>
            <span className="comment-item__time">{timeAgo}</span>
          </div>
        </div>
        <div className="comment-item__stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`comment-item__star${i < rating ? " comment-item__star--filled" : ""}`}
            >
              <Star size={16} fill={i < rating ? "currentColor" : "none"} />
            </span>
          ))}
        </div>
      </div>
      <p className="comment-item__text">"{comment}"</p>
    </article>
  );
}