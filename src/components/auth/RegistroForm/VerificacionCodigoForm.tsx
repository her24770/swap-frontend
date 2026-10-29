"use client";

import type { FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import "../../ui/Button/Button.css";

interface VerificacionCodigoFormProps {
  code: string;
  onCodeChange: (code: string) => void;
  serverError: string | null;
  isVerifying: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCambiarCorreo: () => void;
}

// Segundo paso del registro: el usuario ingresa el código de 6 dígitos enviado a su correo.
export default function VerificacionCodigoForm({
  code,
  onCodeChange,
  serverError,
  isVerifying,
  onSubmit,
  onCambiarCorreo,
}: VerificacionCodigoFormProps) {
  const t = useTranslations('registro.form');

  return (
    <form onSubmit={onSubmit} method="post" noValidate className="registro-form registro-form--verification">
      <div className="registro-form__verification-header">
        <h2 className="registro-form__verification-title">{t('verificationTitle')}</h2>
        <p className="registro-form__verification-description">
          {t('verificationDescription')}
        </p>
      </div>

      <div className="registro-form__field">
        <label className="registro-form__label">{t('verificationCodeLabel')}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder={t('verificationCodePlaceholder')}
          className="registro-form__input registro-form__input--code"
        />
      </div>

      {serverError && (
        <span className="registro-form__error">{serverError}</span>
      )}

      <button
        type="submit"
        disabled={isVerifying}
        className="button button--large button--full-width"
      >
        {isVerifying ? t('submitting') : t('submitWithCode')}
        {!isVerifying && <ChevronRight size={16} />}
      </button>

      <button
        type="button"
        className="registro-form__secondary-action registro-form__secondary-action--center"
        onClick={onCambiarCorreo}
      >
        {t('changeEmail')}
      </button>
    </form>
  );
}
