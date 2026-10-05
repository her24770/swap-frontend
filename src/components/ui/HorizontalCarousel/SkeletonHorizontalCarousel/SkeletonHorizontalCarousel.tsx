import type { ReactNode } from "react";
import { PostCardSkeleton } from '../../../posts/PostCard/PostCardSkeleton/PostCardSkeleton';
import './SkeletonHorizontalCarousel.css';

interface SkeletonHorizontalCarouselProps {
  count?: number;
  renderItem?: () => ReactNode;
}

export function SkeletonHorizontalCarousel({ 
  count = 4, 
  renderItem = () => <PostCardSkeleton /> 
}: SkeletonHorizontalCarouselProps) {
  return (
    <div className="carousel-skeleton" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-carousel__item">
          {renderItem()}
        </div>
      ))}
    </div>
  );
}