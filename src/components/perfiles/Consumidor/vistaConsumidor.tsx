"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import PostRes from "../../posts/PostResumida/PostRes";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import { useGuardados } from "../../../hooks/useGuardados";
import imagePath from "../../../../public/images/uvg.jpg";
import type { Tag } from "../../../types/tag";
import type { Publicacion } from "../../../types/publicacion";

const MOCK_PURCHASES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
  images: [imagePath.src],
}));

export default function VistaConsumidor() {
  const t = useTranslations("perfil");
  const { guardados, loading } = useGuardados();
  const [selectedPost, setSelectedPost] = useState<Publicacion | null>(null);

  return (
    <>
      <section className="perfil-page__section">
        <h2 className="perfil-page__section-title">{t("sections.saved")}</h2>
        {loading && <p className="perfil-page__coming-soon">Cargando guardados...</p>}
        {!loading && guardados.length === 0 && (
          <p className="perfil-page__coming-soon">Aún no tienes publicaciones guardadas.</p>
        )}
        {!loading && guardados.length > 0 && (
          <HorizontalCarousel>
            {guardados.map((pub) => (
              <div key={pub.id_publicacion} className="h-carousel__item">
                <PostCard
                  publicacionId={pub.id_publicacion}
                  modoGuardado
                  tags={mapTags(pub)}
                  title={pub.titulo}
                  price={parseFloat(pub.precio)}
                  description={pub.descripcion}
                  images={pub.imagenes.map((img) => img.url_imagen)}
                  estado={pub.estadoRel?.estado ?? pub.estado}
                  onDetallesClick={() => setSelectedPost(pub)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        )}
      </section>

      <hr className="perfil-page__divider" />

      <section className="perfil-page__section">
        <h2 className="perfil-page__section-title">{t("sections.purchases")}</h2>
        <HorizontalCarousel>
          {MOCK_PURCHASES.map((pub) => (
            <div key={pub.id} className="perfil-page__purchase-item">
              <PostRes
                title={pub.title}
                price={pub.price}
                images={pub.images}
              />
            </div>
          ))}
        </HorizontalCarousel>
      </section>

      {selectedPost && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          type={selectedPost.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
          title={selectedPost.titulo}
          price={parseFloat(selectedPost.precio)}
          description={selectedPost.descripcion}
          imageUrl={selectedPost.imagenes[0]?.url_imagen ?? ""}
          likes={selectedPost.me_gusta}
          publicacionId={selectedPost.id_publicacion}
          sellerName={selectedPost.usuario?.nombre ?? "Usuario de SWAP"}
          sellerRating={Number(selectedPost.usuario?.calificacion ?? 0)}
          sellerId={selectedPost.usuario?.id_usuario}
          sellerImageUrl={selectedPost.usuario?.url_foto_perfil}
          onAcordarCompra={() => console.log("acordar compra")}
        />
      )}
    </>
  );
}

function mapTags(publicacion: Publicacion): Tag[] {
  if (!publicacion.etiquetas?.length) {
    return [{ id: 0, name: publicacion.tipoPerfil?.tipo_perfil ?? "Publicación", colorKey: "diseno" }];
  }

  return publicacion.etiquetas.map((rel) => ({
    id: rel.etiqueta.id_etiqueta,
    name: rel.etiqueta.nombre,
    colorKey: "diseno",
  }));
}
