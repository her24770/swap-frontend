import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    label: string;
    currentPage: number;
    pageCount: number;
    pages: number[];
    onPageChange: (page: number) => void;
};

export default function PublicacionesPagination({ label, currentPage, pageCount, pages, onPageChange }: Props) {
    const t = useTranslations("seccion");
    return (
        <div className="publicaciones-list__pagination" aria-label={label}>
            <button
                className="publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow"
                type="button"
                aria-label={t("pagination.previous")}
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            >
                <ChevronLeft size={16} aria-hidden />
            </button>
            {pages.map((page) => (
                <button
                    key={page}
                    className={`publicaciones-list__pagination-btn${page === currentPage ? " publicaciones-list__pagination-btn--active" : ""}`}
                    type="button"
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className="publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow"
                type="button"
                aria-label={t("pagination.next")}
                disabled={currentPage === pageCount}
                onClick={() => onPageChange(Math.min(currentPage + 1, pageCount))}
            >
                <ChevronRight size={16} aria-hidden />
            </button>
        </div>
    );
}
