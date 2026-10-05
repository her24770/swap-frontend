import { PostCardSkeleton } from "../../posts/PostCard/PostCardSkeleton/PostCardSkeleton";

interface PublicacionesGridSkeletonProps {
  count?: number;
}

export function PublicacionesGridSkeleton({ count = 12 }: PublicacionesGridSkeletonProps) {
  return (
    <div className="publicaciones-list__grid" aria-busy="true" aria-label="Cargando publicaciones">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}
