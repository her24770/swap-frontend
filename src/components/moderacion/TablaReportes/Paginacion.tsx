interface PaginacionProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  labelAnterior: string;
  labelSiguiente: string;
}

export default function Paginacion({ page, total, onChange, labelAnterior, labelSiguiente }: PaginacionProps) {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - page) <= 1) pages.push(i);
    else if (Math.abs(i - page) === 2 && !pages.includes("...")) pages.push("...");
  }
  return (
    <div className="tabla-reportes__pages">
      <button
        type="button"
        className="tabla-reportes__page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={labelAnterior}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="tabla-reportes__dots">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`tabla-reportes__page-btn${page === p ? " tabla-reportes__page-btn--active" : ""}`}
            onClick={() => onChange(p as number)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="tabla-reportes__page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        aria-label={labelSiguiente}
      >
        ›
      </button>
    </div>
  );
}
