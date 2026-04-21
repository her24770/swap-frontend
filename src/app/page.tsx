"use client";

import { useState } from "react";
import PostCard from "../components/posts/PostCard/PostCard";
import { useState, useEffect } from "react";
import { apiClient, type ApiError } from "../lib/apiClient";
import imagePath from "../../public/images/uvg.jpg";
import {TIPO_TAG_MAP} from "../lib/tags";

const ITEMS_PER_PAGE = 12;

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<PublicacionesResponse>("/api/publicacion/");
      setPublicaciones(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error(apiError.message);
      setError(apiError.message || "No fue posible obtener las publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Publicaciones destacadas</h1>
      <p>Explora las publicaciones de la comunidad</p>

      {error && (
        <div className="descubre-page__state">
          <p className="descubre-page__state-text descubre-page__state-text--error">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="descubre-page__empty">
          <div className="descubre-page__empty-icon">🏪</div>
          <h2 className="descubre-page__empty-title">No hay negocios disponibles</h2>
          <p className="descubre-page__empty-description">
            {searchQuery
              ? `No se encontraron resultados para "${searchQuery}"`
              : "Aún no hay negocios estudiantiles publicados."}
          </p>
        </div>
      )}

      {publicaciones.map((publicacion) => {
        const tag = TIPO_TAG_MAP[publicacion.tipo_publicacion];
        return (
          <PostCard
            key={publicacion.id_publicacion}
            tags={tag ? [tag] : []}
            title={publicacion.titulo}
            price={parseFloat(publicacion.precio)}
            description={publicacion.descripcion}
            images={[imagePath.src]}
          />
        );
      })}

      <PostCard
        tags={[
          { id: 10, name: "EjemploTag", colorKey: "assembler" },
          { id: 11, name: "Mate",       colorKey: "matematicas" },
        ]}
        title="Ejemplo de PostCard"
        price={100}
        description="Descripción de ejemplo"
        images={[]}
      />
      <PostCard
        tags={[
          { id: 12, name: "Tercero", colorKey: "fisica" },
          { id: 13, name: "Cuarto",  colorKey: "electronica" },
        ]}
        title="Tercer PostCard"
        price={300}
        description="Tercera descripción de ejemplo"
        images={[]}
      />
      <hr />
    </main>
  );
}