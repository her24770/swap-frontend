"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Flag, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import SearchBar from "../../ui/SearchBar/SearchBar";
import { Link } from "../../../i18n/routing";
import { usuarioService } from "../../../services/usuarioService";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import type { UsuarioModeracion, UsuarioModeracionFilters } from "../../../types/usuarioModeracion";
import "../../../components/ui/Button/Button.css";
import "./UsuariosModeracion.css";

const ITEMS_PER_PAGE = 12;

export default function UsuariosModeracion() {
  const t = useTranslations("moderacion.usuarios");

  const [usuarios, setUsuarios] = useState<UsuarioModeracion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [conReportes, setConReportes] = useState(false);
  const [sort, setSort] = useState<NonNullable<UsuarioModeracionFilters["sort"]>>("nombre");
  const [order, setOrder] = useState<NonNullable<UsuarioModeracionFilters["order"]>>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const filters = useMemo<UsuarioModeracionFilters>(() => ({
    q,
    conReportes: conReportes || undefined,
    sort,
    order,
    page,
    limit: ITEMS_PER_PAGE,
  }), [conReportes, order, page, q, sort]);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuarioService.getModeracion(filters);
      setUsuarios(response.usuarios);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorCarga"));
      setUsuarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setQ(qDraft.trim());
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [qDraft]);

  return (
    <main className="usuarios-moderacion">
      <div className="usuarios-moderacion__header">
        <div>
          <h1 className="usuarios-moderacion__title">{t("title")}</h1>
          <p className="usuarios-moderacion__subtitle">{t("subtitle")}</p>
        </div>
        <span className="usuarios-moderacion__count">{t("resultsCount", { count: total })}</span>
      </div>

      <div className="usuarios-moderacion__filters">
        <SearchBar value={qDraft} onChange={setQDraft} placeholder={t("searchPlaceholder")} />

        <label className="usuarios-moderacion__checkbox">
          <input
            type="checkbox"
            checked={conReportes}
            onChange={(event) => {
              setConReportes(event.target.checked);
              setPage(1);
            }}
          />
          {t("filtros.conReportes")}
        </label>

        <select
          className="usuarios-moderacion__select"
          value={`${sort}:${order}`}
          onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(":");
            setSort(nextSort as typeof sort);
            setOrder(nextOrder as typeof order);
            setPage(1);
          }}
        >
          <option value="nombre:asc">{t("sort.nombreAsc")}</option>
          <option value="nombre:desc">{t("sort.nombreDesc")}</option>
          <option value="reportes_recibidos:desc">{t("sort.reportesDesc")}</option>
          <option value="calificacion:asc">{t("sort.calificacionAsc")}</option>
          <option value="calificacion:desc">{t("sort.calificacionDesc")}</option>
        </select>
      </div>

      {error && <p className="usuarios-moderacion__error">{error}</p>}

      {loading ? (
        <div className="usuarios-moderacion__loading">
          <Loader2 className="usuarios-moderacion__spinner" size={24} />
          {t("loading")}
        </div>
      ) : usuarios.length === 0 ? (
        <div className="usuarios-moderacion__empty">{t("empty")}</div>
      ) : (
        <table className="usuarios-moderacion__table">
          <thead>
            <tr>
              <th>{t("tabla.usuario")}</th>
              <th>{t("tabla.carnet")}</th>
              <th>{t("tabla.correo")}</th>
              <th>{t("tabla.calificacion")}</th>
              <th>{t("tabla.reportes")}</th>
              <th className="usuarios-moderacion__col-acciones">{t("tabla.acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>
                  <div className="usuarios-moderacion__usuario-cell">
                    <div className="usuarios-moderacion__avatar">
                      {usuario.url_foto_perfil ? (
                        <Image
                          src={normalizeImageUrl(usuario.url_foto_perfil)}
                          alt={usuario.nombre}
                          fill
                          sizes="32px"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <span>{usuario.nombre}</span>
                  </div>
                </td>
                <td>{usuario.carnet}</td>
                <td>{usuario.email_institucional}</td>
                <td>{usuario.calificacion != null ? Number(usuario.calificacion).toFixed(1) : t("tabla.sinCalificacion")}</td>
                <td>
                  {usuario.reportes_recibidos > 0 ? (
                    <span className="usuarios-moderacion__badge usuarios-moderacion__badge--reportes">
                      <Flag size={12} />
                      {usuario.reportes_recibidos}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="usuarios-moderacion__col-acciones">
                  <Link
                    href={`/moderacion/perfil/${usuario.id_usuario}`}
                    className="button button--small"
                  >
                    <Eye size={14} />
                    {t("acciones.verPerfil")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="usuarios-moderacion__pagination">
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || loading}
        >
          <ChevronLeft size={14} />
          {t("pagination.anterior")}
        </button>
        <span>{t("pagination.paginaInfo", { page, pageCount })}</span>
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          disabled={page >= pageCount || loading}
        >
          {t("pagination.siguiente")}
          <ChevronRight size={14} />
        </button>
      </div>
    </main>
  );
}