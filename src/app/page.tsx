"use client";
import PostCard from "../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../hooks/fetch/usePublicaciones";
import imagePath from "../../public/images/uvg.jpg";

export default function HomePage() {
  
  const { data, loading, error } = usePublicaciones({ 
    page: 1,
    limit: 10

  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Publicaciones destacadas</h1>
      <p>Explora las publicaciones de la comunidad</p>

      {/* 2. Estados de carga y error */}
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 3. Validación de lista vacía usando 'data' */}
      {!loading && !error && data.length === 0 && (
        <p>No hay publicaciones disponibles en este momento.</p>
      )}

      {/* 4. Renderizado de la lista */}
      <section style={{ display: 'grid', gap: '1rem' }}>
        {data.map((publicacion) => (
          <PostCard 
            key={publicacion.id_publicacion} 
            tags={[]} 
            title={publicacion.titulo} 
            price={parseFloat(publicacion.precio)} 
            description={publicacion.descripcion} 
            images={[imagePath.src]} 
          />
        ))}
      </section>

      <hr style={{ marginTop: '2rem' }} />
    </main>
  );
}