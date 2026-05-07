"use client";

import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import PostRes from "../../posts/PostResumida/PostRes";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import imagePath from "../../../../public/images/uvg.jpg";
import type { Tag } from "../../../types/tag";

const MOCK_SAVED = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
  description: "Brinda tutorías para Assembler, específicamente para ayudar en las labs.",
  tags: [
    { id: 1, name: "Assembler",   colorKey: "assembler"   },
    { id: 3, name: "Electrónica", colorKey: "electronica" },
  ] as Tag[],
  estado: "activo",
  images: [imagePath.src],
}));

const MOCK_PURCHASES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
  images: [imagePath.src],
}));

export default function VistaConsumidor() {
  const t = useTranslations("perfil");

  return (
    <>
      <section className="perfil-page__section">
        <h2 className="perfil-page__section-title">{t("sections.saved")}</h2>
        <HorizontalCarousel>
          {MOCK_SAVED.map((pub) => (
            <div key={pub.id} className="h-carousel__item">
              <PostCard
                tags={pub.tags}
                title={pub.title}
                price={pub.price}
                description={pub.description}
                images={pub.images}
                estado={pub.estado}
                canEdit={false}
              />
            </div>
          ))}
        </HorizontalCarousel>
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
    </>
  );
}