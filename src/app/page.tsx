"use client";
import PostCard from "../components/PostCard/PostCard";

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>¡Servidor Funcionando!</h1>
      <p>Esta página se está sirviendo desde un contenedor Docker usando Next.js.</p>
      <PostCard tags={[{ id: 1, name: "EjemploTag", type: "categoria" }, { id: 2, name: "Mate", type: "categoria" }]} title="Ejemplo de PostCard" price={100} description="Descripción de ejemplo" images={[]} />
      <PostCard tags={[{ id: 3, name: "Tercero", type: "categoria" }, { id: 4, name: "Cuarto", type: "categoria" }]} title="Tercer PostCard" price={300} description="Tercera descripción de ejemplo" images={[]} />
      <hr />
    </main>
  )
}