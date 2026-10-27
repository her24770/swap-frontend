import Image from "next/image";

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface UsuarioCellProps {
  nombre: string;
  email: string;
  foto?: string;
}

export default function UsuarioCell({ nombre, email, foto }: UsuarioCellProps) {
  return (
    <div className="tabla-reportes__user-cell">
      <div className="tabla-reportes__avatar">
        {foto ? (
          <Image src={foto} alt={nombre} fill className="img-cover" unoptimized />
        ) : (
          <span>{initials(nombre)}</span>
        )}
      </div>
      <div className="tabla-reportes__user-info">
        <span className="tabla-reportes__user-name">{nombre}</span>
        <span className="tabla-reportes__user-email">{email}</span>
      </div>
    </div>
  );
}
