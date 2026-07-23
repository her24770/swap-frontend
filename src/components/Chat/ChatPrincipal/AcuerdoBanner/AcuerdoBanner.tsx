import Image from "next/image";
import { MapPin, Calendar, Box} from "lucide-react";
import type { AcuerdoHistorial } from "../../../../types/acuerdo";
import "./AcuerdoBanner.css";

interface AcuerdoBannerProps {
  acuerdo?: AcuerdoHistorial | null;
  onDetalles?: () => void;
  onCrear?: () => void;
}

export default function AcuerdoBanner({ acuerdo, onDetalles, onCrear }: AcuerdoBannerProps) {
  const imagenPrincipal = acuerdo?.publicacion.imagenes[0]?.url_imagen;

  if (!acuerdo) {
    return (
      <div className="acuerdo-banner acuerdo-banner--empty">
        <span className="acuerdo-banner__create-label">Sin acuerdo acordado</span>
        <button
          type="button"
          className="acuerdo-banner__btn-create"
          onClick={onCrear}
        >
          + Crear acuerdo
        </button>
      </div>
    );
  }

  return (
    <div className="acuerdo-banner">
      <div className="acuerdo-banner__img">
        {imagenPrincipal
          ? <Image src={imagenPrincipal} alt={acuerdo.publicacion.titulo} fill style={{ objectFit: "cover" }} unoptimized />
          : <span className="acuerdo-banner__img-placeholder"><Box size={24} /></span>
        }
      </div>
      <div className="acuerdo-banner__info">
        <span className="acuerdo-banner__label">Próximo acuerdo</span>
        <span className="acuerdo-banner__name">{acuerdo.publicacion.titulo}</span>
        <div className="acuerdo-banner__meta">
          <span><MapPin size={11} /> {acuerdo.lugar_entrega}</span>
          <span><Calendar size={11} /> {acuerdo.fecha_entrega}</span>
        </div>
      </div>
      <button
        type="button"
        className="acuerdo-banner__btn"
        onClick={onDetalles}
      >
        Detalles
      </button>
    </div>
  );
}
