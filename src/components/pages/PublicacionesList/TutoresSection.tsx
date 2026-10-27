import { useTranslations } from "next-intl";
import { SkeletonHorizontalCarousel } from "../../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel";
import { UserResCardSkeleton } from "../../posts/UserResumida/UserResCardSkeleton/UserResCardSkeleton";
import type { TutorFiltrado } from "../../../types/publicacion";
import { ErrorInline } from "./publicacionesListUtils";
import TutoresCarousel from "./TutoresCarousel";

type Props = {
    tutores: TutorFiltrado[];
    loading: boolean;
    error: unknown;
    onSelectTutor: (tutor: TutorFiltrado) => void;
};

// Sección "Tutores" de la vista general de tutorías.
export default function TutoresSection({ tutores, loading, error, onSelectTutor }: Props) {
    const t = useTranslations("seccion");
    return (
        <section className="publicaciones-list__section">
            <h2 className="publicaciones-list__section-title">{t("tutores")}</h2>
            <ErrorInline message={t("error_loading_section")} error={error} />
            {loading ? (
                <div className="publicaciones-list__carousel-wrap">
                    <SkeletonHorizontalCarousel count={4} renderItem={() => <UserResCardSkeleton />} />
                </div>
            ) : tutores.length === 0 ? (
                <p>{t("noTutores")}</p>
            ) : (
                <TutoresCarousel tutores={tutores} onSelectTutor={onSelectTutor} />
            )}
        </section>
    );
}
