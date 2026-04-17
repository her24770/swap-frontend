import { ChevronRight } from "lucide-react";
import "../../ui/Button/Button.css";
import "./PostRes.css";
import PostImage from "../PostCard/PostImage/PostImage";

interface PostCardProps {
  title: string;
  price: number;
  images: string[];
}

export default function PostCard({ title, price, images }: PostCardProps) {
  const handleDetailsClick = () => {
    console.log(`Ver detalles de: ${title}`);
  };

  return (
    <article className="post-res-card">
      <div className="post-res-card__media">
        <PostImage images={images} alt={title} compact/>
      </div>
      <div className="post-res-card__content">
        <div className="post-res-card__info">
          <h3 className="post-res-card__title">{title}</h3>
          <span className="post-res-card__price">Q{price}</span>
        </div>
        
        <div className="post-res-card__footer">
          <button
            type="button"
            className="button button--small"
            onClick={handleDetailsClick}
          >
            Detalles <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}