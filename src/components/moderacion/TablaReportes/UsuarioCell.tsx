import Avatar from "../../ui/Avatar/Avatar";

interface UsuarioCellProps {
  nombre: string;
  email: string;
  foto?: string;
}

export default function UsuarioCell({ nombre, email, foto }: UsuarioCellProps) {
  return (
    <div className="tabla-reportes__user-cell">
      <div className="tabla-reportes__avatar">
        <Avatar src={foto} name={nombre} size={32} fill className="img-cover" />
      </div>
      <div className="tabla-reportes__user-info">
        <span className="tabla-reportes__user-name">{nombre}</span>
        <span className="tabla-reportes__user-email">{email}</span>
      </div>
    </div>
  );
}
