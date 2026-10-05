"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("updateProfileModal.form");

  return (
    <div className="perfil-form">
      <div className="perfil-form__row">
        <div className="perfil-form__field">
          <label className="perfil-form__label">{t("firstName")}</label>
          <input
            type="text"
            className="perfil-form__input"
            placeholder={nombre}
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
          />
        </div>
        <div className="perfil-form__field">
          <label className="perfil-form__label">{t("lastName")}</label>
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
        <label className="perfil-form__label">{t("description")}</label>
        <textarea
          className="perfil-form__textarea"
          placeholder={t("descriptionPlaceholder")}
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
        />
      </div>
    </div>
  );
}