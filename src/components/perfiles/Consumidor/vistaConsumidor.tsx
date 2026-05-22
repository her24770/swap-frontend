"use client";

import { useTranslations } from "next-intl";
import PostRes from "../../posts/PostResumida/PostRes";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import PublicacionesGuardadas from "./PublicacionesGuardadas/PublicacionesGuardadas";
import imagePath from "../../../../public/images/uvg.jpg";

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
      <PublicacionesGuardadas />

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
