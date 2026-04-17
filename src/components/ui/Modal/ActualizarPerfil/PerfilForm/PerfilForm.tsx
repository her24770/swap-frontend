"use client";

import "./PerfilForm.css";

interface PerfilFormProps {  
  nombre: string;
  apellido: string;
  descripcion: string;
  onNombreChange: (v: string) => void;
  onApellidoChange: (v: string) => void;
  onDescripcionChange: (v: string) => void;
}

export default function PerfilForm({
  nombre,
  apellido,
  descripcion,
  onNombreChange,
  onApellidoChange,
  onDescripcionChange,
}: PerfilFormProps) {
  return (
    <div className="perfil-form">
      <div className="perfil-form__row">
        <div className="perfil-form__field">
          <label className="perfil-form__label">Nombre</label>
          <input
            type="text"
            className="perfil-form__input"
            placeholder={nombre}
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
          />
        </div>
        <div className="perfil-form__field">
          <label className="perfil-form__label">Apellido</label>
          <input
            type="text"
            className="perfil-form__input"
            placeholder={apellido}
            value={apellido}
            onChange={(e) => onApellidoChange(e.target.value)}
          />
        </div>
      </div>

      <div className="perfil-form__field">
        <label className="perfil-form__label">Descripcion</label>
        <textarea
          className="perfil-form__textarea"
          placeholder="Agrega una descripcion"
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
        />
      </div>
    </div>
  );
}