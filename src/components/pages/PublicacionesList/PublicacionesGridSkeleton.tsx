import { useTranslations } from "next-intl";
import { PostCardSkeleton } from "../../posts/PostCard/PostCardSkeleton/PostCardSkeleton";

interface PublicacionesGridSkeletonProps {
  count?: number;
}

export function PublicacionesGridSkeleton({ count = 12 }: PublicacionesGridSkeletonProps) {
  const t = useTranslations("posts");

  return (
    <div className="publicaciones-list__grid" aria-busy="true" aria-label={t("loadingAria")}>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}
