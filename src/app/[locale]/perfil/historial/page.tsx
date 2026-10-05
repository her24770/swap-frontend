"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "../../../../i18n/routing";
import HistorialAcuerdos from "../../../../components/perfiles/Consumidor/HistorialAcuerdos/HistorialAcuerdos";
import SearchBar from "../../../../components/ui/SearchBar/SearchBar";
import { apiClient } from "../../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../../lib/authResponse";
import { useAuthStore } from "../../../../store/authStore";
import type { TipoCompraHistorial, TipoHistorialAcuerdo } from "../../../../types/acuerdo";
import type { ApiResult } from "../../../../types/ApiResult";
import type { AuthResponse } from "../../../../types/usuario";
import "../PerfilConsumidorPage.css";
import "./HistorialPage.css";

const ITEMS_PER_PAGE = 24;

export default function PerfilHistorialPage() {
  const t = useTranslations("perfil");
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const idUsuarioStore = useAuthStore((s) => s.usuario?.id_usuario);
  const [idUsuario, setIdUsuario] = useState<number | undefined>(idUsuarioStore);
  const [loadingSession, setLoadingSession] = useState(!idUsuarioStore);
  const [error, setError] = useState<string | null>(null);

  const tipo = useMemo<TipoHistorialAcuerdo>(() => {
    return searchParams.get("tipo") === "tutoria" ? "tutoria" : "producto";
  }, [searchParams]);

  const compraFilter = useMemo<TipoCompraHistorial>(() => {
    const value = searchParams.get("compraTipo");
    return value === "material" || value === "negocio" ? value : "producto";
  }, [searchParams]);

  const searchQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  const currentPage = useMemo(() => {
    const page = Number(searchParams.get("page") ?? "1");
    return Number.isInteger(page) && page > 0 ? page : 1;
  }, [searchParams]);

  useEffect(() => {
    if (idUsuarioStore) {
      setIdUsuario(idUsuarioStore);
      setLoadingSession(false);
      return;
    }

    let isMounted = true;
    setLoadingSession(true);
    apiClient
      .get<ApiResult<AuthResponse> | AuthResponse>("/api/auth/me")
      .then((response) => {
        if (!isMounted) return;
        const sesion = unwrapAuthResponse(response);
        login(sesion.usuario, sesion.rol);
        setIdUsuario(sesion.usuario.id_usuario);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || t("history.error"));
      })
      .finally(() => {
        if (isMounted) setLoadingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [idUsuarioStore, login, t]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const title = tipo === "tutoria" ? t("sections.tutoringHistory") : t("sections.purchases");
  const emptyMessage = tipo === "tutoria" ? t("history.emptyTutoring") : t("history.emptyProducts");
  const updateQuery = useCallback((updates: { page?: number; compraTipo?: TipoCompraHistorial; q?: string }) => {
    const params = new URLSearchParams({ tipo });
    params.set("page", (updates.page ?? 1).toString());

    const nextCompraTipo = updates.compraTipo ?? compraFilter;
    if (tipo === "producto") params.set("compraTipo", nextCompraTipo);

    const nextSearch = updates.q ?? searchQuery;
    if (nextSearch.trim()) params.set("q", nextSearch.trim());

    router.push(`/perfil/historial?${params.toString()}`);
  }, [compraFilter, router, searchQuery, tipo]);

  useEffect(() => {
    if (searchInput === searchQuery) return;

    const timer = window.setTimeout(() => {
      updateQuery({ q: searchInput, page: 1 });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchQuery, updateQuery]);

  return (
    <main className="perfil-page historial-page">
      <div className="historial-page__heading">
        <h1 className="historial-page__title">{title}</h1>
        <Link href="/perfil" className="perfil-page__secondary-btn historial-page__back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          {t("history.backToProfile")}
        </Link>
      </div>

      <div className="historial-page__tools">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t("history.searchPlaceholder")}
        />
      </div>

      {loadingSession ? (
        <p className="perfil-page__loading">{t("loading")}</p>
      ) : error ? (
        <p className="perfil-page__coming-soon">{error}</p>
      ) : (
        <HistorialAcuerdos
          idUsuario={idUsuario}
          tipo={tipo}
          title={title}
          emptyMessage={emptyMessage}
          variant="grid"
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          showCompraFilter={tipo === "producto"}
          compraFilter={compraFilter}
          onCompraFilterChange={(filter) => updateQuery({ compraTipo: filter, page: 1 })}
          searchQuery={searchQuery}
        />
      )}
    </main>
  );
}
