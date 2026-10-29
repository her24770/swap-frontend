export const VISIBLE_PAGINATION_PAGES = 5;

export function ErrorInline({ error, message }: { error: unknown; message: string }) {
    return error ? <p className="publicaciones-list__error-inline">{message}</p> : null;
}

function toStarRating(calificacion: number | null | undefined): number {
    return Math.min(5, Math.max(0, Math.round(calificacion ?? 0)));
}

export function toVisualStarRating(calificacion: number | null | undefined): number {
    if (calificacion != null && calificacion > 0) {
        return toStarRating(calificacion);
    }
    return 4;
}
