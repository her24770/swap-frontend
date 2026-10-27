import type { ReactNode } from "react";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import { SkeletonHorizontalCarousel } from "../../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel";
import type { Publicacion } from "../../../types/publicacion";
import { ErrorInline } from "./publicacionesListUtils";

type Props = {
    title: string;
    errorMessage: string;
    error: unknown;
    loading: boolean;
    publicaciones: Publicacion[];
    renderPostCard: (p: Publicacion) => ReactNode;
};

export default function PostsCarouselSection({ title, errorMessage, error, loading, publicaciones, renderPostCard }: Props) {
    return (
        <section className="publicaciones-list__section">
            <h2 className="publicaciones-list__section-title">{title}</h2>
            <ErrorInline message={errorMessage} error={error} />
            {loading ? (
                <div className="publicaciones-list__carousel-wrap">
                    <SkeletonHorizontalCarousel count={4} />
                </div>
            ) : (
                <div className="publicaciones-list__carousel-wrap">
                    <HorizontalCarousel showPagination={false}>
                        {publicaciones.map((p) => (
                            <div key={p.id_publicacion} className="h-carousel__item">
                                {renderPostCard(p)}
                            </div>
                        ))}
                    </HorizontalCarousel>
                </div>
            )}
        </section>
    );
}
