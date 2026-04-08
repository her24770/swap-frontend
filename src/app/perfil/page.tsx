"use client";
import PostCard from "../../components/PostCard/PostCard";
import UserCard from "../../components/UserCard/UserCard";

export default function Perfil() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>perfil del usuario</h1>
      <br />
        <UserCard 
          name="Juan Pérez" 
          description="Apasionado por el intercambio de objetos y experiencias. Siempre buscando nuevas oportunidades para conectar con personas y compartir lo que tengo." 
          imageUrl="https://randomuser.me/api/portraits/men/75.jpg"
          rating={2}
          totalReviews={12}
          contacts={[
            { platform: 'instagram', url: 'https://instagram.com/juanperez' },
            { platform: 'whatsapp', url: 'https://wa.me/1234567890' },
            { platform: 'linkedin', url: 'https://linkedin.com/in/juanperez' }
          ]}
        />
      <h1>Publicaciones Populares</h1>
      <br />

      <PostCard tags={[{ id: 1, name: "EjemploTag", type: "categoria" }, { id: 2, name: "Mate", type: "categoria" }]} title="Ejemplo de PostCard" price={100} description="Descripción de ejemplo" images={[]} />
      <PostCard tags={[{ id: 3, name: "Tercero", type: "categoria" }, { id: 4, name: "Cuarto", type: "categoria" }]} title="Tercer PostCard" price={300} description="Tercera descripción de ejemplo" images={[]} />
      <hr />
      
    </main>
  )
}