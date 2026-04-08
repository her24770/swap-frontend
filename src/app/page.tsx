"use client";
import PostCard from "../components/PostCard/PostCard";
import { useState, useEffect } from "react";
import { apiClient, type ApiError } from "../lib/apiClient";
import imagePath from "../../public/images/uvg.jpg" //Temporal en lo que se implementa la subida de imagenes

interface Publicacion {
  id_publicacion: number,
  titulo: string,
  descripcion: string,
  precio: string,
  estado: number,
  tipo_publicacion: number,
  me_gusta: number,
  fecha_publicacion: string,
  id_usuario: number,
  imagenes: [],
  etiquetas: []
}

interface PublicacionesResponse {
  message: string,
  data: Publicacion[]
}

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState([]);

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

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Publicaciones destacadas</h1>
      <p>Explora las publicaciones de la comunidad</p>

      {loading && <p>Cargando Publicaciones...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && publicaciones.length === 0 && (
        <p>No hay publicaciones disponibles.</p>
      )}


      {publicaciones.map((publicacion) => (
        <PostCard key={publicacion.id_publicacion} tags={[]} title={publicacion.titulo} price={publicacion.precio} description={publicacion.descripcion} images={[imagePath.src]} />
      ))}
      <PostCard tags={[{ id: 1, name: "EjemploTag", type: "categoria" }, { id: 2, name: "Mate", type: "categoria" }]} title="Ejemplo de PostCard" price={100} description="Descripción de ejemplo" images={[]} />
      <PostCard tags={[{ id: 3, name: "Tercero", type: "categoria" }, { id: 4, name: "Cuarto", type: "categoria" }]} title="Tercer PostCard" price={300} description="Tercera descripción de ejemplo" images={[]} />
      <hr />
    </main>
  )
}