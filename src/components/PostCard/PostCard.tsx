import FilterTag from "../FilterTag/FilterTag";
import PostImage from "./PostImage/PostImage";
import ActionButton from "./PostDetailsButton/PostDetailsButton";
import "./PostCard.css";

interface PostCardProps {
  title: string;
  price: number;
  description: string;
  images: string[];
  tags: { id: number; name: string; type: string }[];
}


export default function PostCard({ 
  title, 
  price, 
  description, 
  images, 
  tags 
}: PostCardProps) {
  
  const handleDetailsClick = () => {
    console.log(`Ver detalles de: ${title}`);
  };

  return (
    <article className="post-card">
      
      <header className="post-card__header">
        {tags.map((tag) => (
          <FilterTag 
            key={tag.id} 
            label={tag.name} 
            onClick={() => console.log(`Filtrar por: ${tag.name}`)}
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

        {/* 4. Footer: Acción principal */}
        <footer className="post-card__footer">
          <ActionButton 
            label="Detalles" 
            onClick={handleDetailsClick} 
          />
        </footer>
      </div>
    </article>
  );
}