import TagBadge from "../../ui/TagBadge/TagBadge";
import PostImage from "./PostImage/PostImage";
import {ChevronRight } from "lucide-react";
import "../../ui/Button/Button";
import "./PostCard.css";
import type { Tag } from "../../../types/tag";

interface PostCardProps {
  title: string;
  price: number;
  description: string;
  images: string[];
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
}


export default function PostCard({ 
  title, 
  price, 
  description, 
  images, 
  tags,
  onTagClick,
}: PostCardProps) {
  
  const handleDetailsClick = () => {
    console.log(`Ver detalles de: ${title}`);
  };

  return (
    <article className="post-card">
      
      <header className="post-card__header">
        {tags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            onClick={onTagClick}
          />
        ))}
      </header>

      <div className="post-card__media">
        <PostImage images={images} alt={title} />
      </div>

      <div className="post-card__content">
        <div className="post-card__info">
          <h3 className="post-card__title">{title}</h3>
          <span className="post-card__price">Q{price}</span>
        </div>

        <p className="post-card__description">
          {description}
        </p>

        <footer className="post-card__footer">
          <button
            type="button"
            className="button button--small"
            onClick={handleDetailsClick}
          >
            Detalles <ChevronRight size={14} />
          </button>
        </footer>
      </div>
    </article>
  );
}