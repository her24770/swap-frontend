"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToast } from "../../../hooks/useToast";
import { useRouter } from "../../../i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../lib/authResponse";
import { schemaRegistro, type RegistroFormData, type RegistroFormInput } from "../../../schemas/zodSchemas";
import { useAuthStore, type Rol, type Usuario } from "../../../store/authStore";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import TerminosyCondiciones from "../../../components/ui/Modal/TerminosyCondiciones/TerminosyCondiciones";
import VerificacionCodigoForm from "./VerificacionCodigoForm";
import EtiquetasSelector from "./EtiquetasSelector";
import CampoPassword from "./CampoPassword";
import TerminosCheckbox from "./TerminosCheckbox";
import "../../ui/Button/Button.css"
import "./RegistroForm.css";

type RegistroPayload = {
  nombre: string;
  carnet: number;
  email_institucional: string;
  password: string;
  url_foto_perfil: string;
  descripcion: string;
  etiquetas: number[];
};

export const extractCarnetFromEmail = (email: string): number | null => {
  const match = email.match(/^[a-zA-Z]+(\d+)@uvg\.edu\.gt$/);
  if (!match) return null;
  return Number(match[1]);
};

export default function RegistroForm() {
  const t = useTranslations('registro.form');

  const router = useRouter();
  const toast = useToast();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<RegistroPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [showTerminos, setShowTerminos] = useState(false);
  const { etiquetas: etiquetasBD, loading: etiquetasLoading, error: etiquetasError } =
    useTodasEtiquetas({soloPadres : true});

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormInput, unknown, RegistroFormData>({
    resolver: zodResolver(schemaRegistro),
    defaultValues: {
      nombre: "",
      apellido: "",
      email_institucional: "",
      password: "",
      confirmar_password: "",
      url_foto_perfil: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL ?? "",
      descripcion: "Sin descripción",
      etiquetas: [],
    },
  });

  const selectedEtiquetas = (useWatch({ control, name: "etiquetas" }) ?? []) as number[];

  const toggleEtiqueta = (id: number) => {
    const current = selectedEtiquetas;
    const updated = current.includes(id)
      ? current.filter((tagId) => tagId !== id)
      : [...current, id];
    setValue("etiquetas", updated, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: RegistroFormData) => {
    try {
      setServerError(null);
      setTermsError(null);
      // validate etiquetas count
      const count = data.etiquetas?.length ?? 0;
      if (count < 3) {
        setServerError(t('tagsCountMin') || 'Selecciona al menos 3 etiquetas.');
        return;
      }
      if (count > 20) {
        setServerError(t('tagsCountMax') || 'No puedes seleccionar más de 20 etiquetas.');
        return;
      }
      if (!aceptaTerminos) {
        setTermsError(t('termsRequired') || 'Debes aceptar los Términos y Condiciones para continuar.');
        return;
      }
      const carnet = extractCarnetFromEmail(data.email_institucional);
      if (!carnet) {
        setServerError(t('emailInvalid'));
        return;
      }

      const payload: RegistroPayload = {
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        carnet,
        email_institucional: data.email_institucional,
        password: data.password,
        url_foto_perfil: data.url_foto_perfil || process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || "",
        descripcion: data.descripcion || "Sin descripción",
        etiquetas: data.etiquetas,
      };

      await apiClient.post("/api/auth/send-register-code", {
        email_institucional: payload.email_institucional,
        carnet: payload.carnet,
      });
      setPendingRegistration(payload);
      setVerificationStep(true);
      toast.success(t('toast.codeSent'));
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.message || t('toast.errorFallback');
      setServerError(message);
      toast.error(message);
    }
  };

  const handleVerificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setServerError(null);
      if (!/^\d{6}$/.test(verificationCode)) {
        setServerError(t('verificationCodeInvalid'));
        return;
      }

      if (!pendingRegistration) {
        setServerError(t('verificationSessionExpired'));
        setVerificationStep(false);
        return;
      }

      setIsVerifying(true);
      const respuesta = await apiClient.post<{ usuario: Usuario; rol: Rol }>("/api/auth/register", {
        ...pendingRegistration,
        codigo_verificacion: verificationCode,
      });
      const sesion = unwrapAuthResponse(respuesta);
      login(sesion.usuario, sesion.rol);
      router.replace({ pathname: "/", query: { registered: "true" } });
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.message || t('toast.errorFallback');
      setServerError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (verificationStep) {
    return (
      <VerificacionCodigoForm
        code={verificationCode}
        onCodeChange={setVerificationCode}
        serverError={serverError}
        isVerifying={isVerifying}
        onSubmit={handleVerificationSubmit}
        onCambiarCorreo={() => {
          setVerificationStep(false);
          setVerificationCode("");
          setPendingRegistration(null);
          setServerError(null);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="post" noValidate className="registro-form">

      {/* Nombre y Apellido */}
      <div className="registro-form__row">
        <div className="registro-form__field">
          <label className="registro-form__label">{t('firstNameLabel')}</label>
          <input
            type="text"
            placeholder={t('firstNamePlaceholder')}
            {...register("nombre")}
            className={`registro-form__input${errors.nombre ? " registro-form__input--error" : ""}`}
          />
          {errors.nombre && (
            <span className="registro-form__error">{errors.nombre.message}</span>
          )}
        </div>

        <div className="registro-form__field">
          <label className="registro-form__label">{t('lastNameLabel')}</label>
          <input
            type="text"
            placeholder={t('lastNamePlaceholder')}
            {...register("apellido")}
            className={`registro-form__input${errors.apellido ? " registro-form__input--error" : ""}`}
          />
          {errors.apellido && (
            <span className="registro-form__error">{errors.apellido.message}</span>
          )}
        </div>
      </div>

      {/* Email del usuario */}
      <div className="registro-form__field">
        <label className="registro-form__label">{t('emailLabel')}</label>
        <input
          type="email"
          placeholder={t('emailPlaceholder')}
          readOnly={verificationStep}
          {...register("email_institucional")}
          className={`registro-form__input${errors.email_institucional ? " registro-form__input--error" : ""}`}
        />
        {errors.email_institucional && (
          <span className="registro-form__error">{errors.email_institucional.message}</span>
        )}
      </div>

      <EtiquetasSelector
        etiquetas={etiquetasBD}
        loading={etiquetasLoading}
        loadError={etiquetasError}
        fieldError={errors.etiquetas?.message}
        selected={selectedEtiquetas}
        onToggle={toggleEtiqueta}
      />

      <CampoPassword
        label={t('passwordLabel')}
        placeholder={t('passwordPlaceholder')}
        registration={register("password")}
        error={errors.password?.message}
      />

      <CampoPassword
        label={t('confirmPasswordLabel')}
        placeholder={t('confirmPasswordPlaceholder')}
        registration={register("confirmar_password")}
        error={errors.confirmar_password?.message}
      />

      {serverError && (
        <span className="registro-form__error">{serverError}</span>
      )}

      <TerminosCheckbox
        accepted={aceptaTerminos}
        error={termsError}
        onToggle={() => {
          setAceptaTerminos((prev) => !prev);
          setTermsError(null);
        }}
        onOpenTerminos={() => setShowTerminos(true)}
      />

      {/* Botón de submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="button button--large button--full-width"
      >
        {isSubmitting ? t('sendingCode') : t('submit')}
        {!isSubmitting && <ChevronRight size={16} />}
      </button>

      <TerminosyCondiciones isOpen={showTerminos} onClose={() => setShowTerminos(false)} />

    </form>
  );
}
