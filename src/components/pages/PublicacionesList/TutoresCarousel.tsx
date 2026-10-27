import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import UserResCard from "../../posts/UserResumida/UserResCard";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import type { TutorFiltrado } from "../../../types/publicacion";
import { toVisualStarRating } from "./publicacionesListUtils";

type Props = {
    tutores: TutorFiltrado[];
    onSelectTutor: (tutor: TutorFiltrado) => void;
};

export default function TutoresCarousel({ tutores, onSelectTutor }: Props) {
    return (
        <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
            <HorizontalCarousel showPagination={false}>
                {tutores.map((tutor) => (
                    <div key={tutor.id_usuario} className="h-carousel__item">
                        <UserResCard
                            userId={tutor.id_usuario}
                            userName={tutor.nombre}
                            userRating={toVisualStarRating(tutor.calificacion)}
                            userImageUrl={
                                tutor.url_foto_perfil ? normalizeImageUrl(tutor.url_foto_perfil) : undefined
                            }
                            onDetallesClick={() => onSelectTutor(tutor)}
                        />
                    </div>
                ))}
            </HorizontalCarousel>
        </div>
    );
}
