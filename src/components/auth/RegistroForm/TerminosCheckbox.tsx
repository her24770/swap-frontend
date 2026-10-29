"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface TerminosCheckboxProps {
  accepted: boolean;
  error: string | null;
  onToggle: () => void;
  onOpenTerminos: () => void;
}

// Casilla de aceptación de términos y condiciones, con enlace para leerlos.
export default function TerminosCheckbox({ accepted, error, onToggle, onOpenTerminos }: TerminosCheckboxProps) {
  const t = useTranslations('registro.form');

  return (
    <div className="registro-form__field">
      <div className="registro-form__terms">
        <button
          type="button"
          aria-pressed={accepted}
          onClick={onToggle}
          className="registro-form__terms-checkbox"
        >
          <span className={`registro-form__tags-checkbox${accepted ? " registro-form__tags-checkbox--checked" : ""}${error ? " registro-form__tags-checkbox--error" : ""}`}>
            {accepted && <Check size={11} strokeWidth={3} color="white" />}
          </span>
        </button>
        <p className="registro-form__terms-text">
          {t('termsPrefix')}{" "}
          <button
            type="button"
            className="registro-form__terms-link"
            onClick={onOpenTerminos}
          >
            {t('termsLinkText')}
          </button>
        </p>
      </div>
      {error && (
        <span className="registro-form__error">{error}</span>
      )}
    </div>
  );
}
