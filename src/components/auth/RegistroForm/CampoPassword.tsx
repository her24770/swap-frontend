"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface CampoPasswordProps {
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

// Campo de contraseña con botón para mostrar u ocultar el texto.
export default function CampoPassword({ label, placeholder, registration, error }: CampoPasswordProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="registro-form__field">
      <label className="registro-form__label">{label}</label>
      <div className="registro-form__input-wrapper">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          {...registration}
          className={`registro-form__input registro-form__input--password${error ? " registro-form__input--error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="registro-form__toggle-password"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <span className="registro-form__error">{error}</span>
      )}
    </div>
  );
}
