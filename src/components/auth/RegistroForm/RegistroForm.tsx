"use client";

import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight, ChevronDown, Check, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToast } from "../../../hooks/useToast";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../lib/authResponse";
import { schemaRegistro, type RegistroFormData } from "../../../schemas/zodSchemas";
import { useAuthStore, type Rol, type Usuario } from "../../../store/authStore";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<RegistroPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { etiquetas: etiquetasBD, loading: etiquetasLoading, error: etiquetasError } =
    useTodasEtiquetas({soloPadres : true});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
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

  const toggleEtiqueta = (id: number) => {
    const current = watch("etiquetas") ?? [];
    const updated = current.includes(id)
      ? current.filter((tagId) => tagId !== id)
      : [...current, id];
    setValue("etiquetas", updated, { shouldValidate: true, shouldDirty: true });
  };

  const selectedEtiquetas: number[] = watch("etiquetas") ?? [];

  const triggerLabel = etiquetasLoading
    ? t("tagsLoading")
    : selectedEtiquetas.length === 0
      ? t("tagsPlaceholder")
      : `${selectedEtiquetas.length} ${selectedEtiquetas.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"}`;

  const onSubmit = async (data: RegistroFormData) => {
    try {
      setServerError(null);
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
      router.push("/?registered=true");
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
      <form onSubmit={handleVerificationSubmit} noValidate className="registro-form registro-form--verification">
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
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
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
          onClick={() => {
            setVerificationStep(false);
            setVerificationCode("");
            setPendingRegistration(null);
            setServerError(null);
          }}
        >
          {t('changeEmail')}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="registro-form">

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

      {/*tags del perfil*/}
      <div className="registro-form__field">
        <label className = "registro-form__label">{t('tagsLabel')}</label>
        <div ref={dropdownRef} className="registro-form__tags-dropdown">
          <button
            type="button"
            disabled={etiquetasLoading}
            onClick={() => setDropdownOpen((prev) => !(prev))}
            className= {[
              "registro-form__tags-trigger",
              selectedEtiquetas.length > 0 ? "registro-form__tags-trigger--has-value" : "",
              dropdownOpen ? "registro-form__tags-trigger--open" : "",
              errors.etiquetas ? "registro-form__tags-trigger--error" : "",
            ].join(" ")}>
              <span>{triggerLabel}</span>
              <ChevronDown size={16} className={`registro-form__tags-chevron${dropdownOpen ? " registro-form__tags-chevron--open" : ""}`} />
            </button>

            {dropdownOpen && !etiquetasLoading && (
              <div className="registro-form__tags-menu">
                {etiquetasBD.map((etiqueta) => {
                  const selected = selectedEtiquetas.includes(etiqueta.id_etiqueta);
                  return (
                    <button 
                    key={etiqueta.id_etiqueta}
                    type="button"
                    onClick={() => toggleEtiqueta(etiqueta.id_etiqueta)}
                    className={`registro-form__tags-option${selected ? " registro-form__tags-option--selected" : ""}`}
                    >
                      <span className={`registro-form__tags-checkbox${selected ? " registro-form__tags-checkbox--checked" : ""}`}>
                        {selected && <Check size={11} strokeWidth={3} color="white" />}
                      </span>
                      {etiqueta.nombre}
                    </button>
                  );
                })}
              </div>
            )}
        </div>

          {selectedEtiquetas.length > 0 && (
            <div className="registro-form__tags-list">
              {selectedEtiquetas.map((id) => {
                const etiqueta = etiquetasBD.find((e) => e.id_etiqueta === id);
                return etiqueta ?(
                  <span key={id} className="registro-form__tag">
                    {etiqueta.nombre}
                    <button 
                    type="button"
                    onClick={() => toggleEtiqueta(id)}
                    className="registro-form__tag-remove">
                      <X size={11} strokeWidth = {2.5} />
                    </button>
                  </span>
                ): null;
              })}
            </div>
          )}
        {etiquetasError && (
          <span className="registro-form__error">{etiquetasError}</span>
        )}
        {errors.etiquetas && (
          <span className="registro-form__error">{errors.etiquetas.message}</span>
        )}
      </div>

      {/* Contraseña */}
      <div className="registro-form__field">
        <label className="registro-form__label">{t('passwordLabel')}</label>
        <div className="registro-form__input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('passwordPlaceholder')}
            {...register("password")}
            className={`registro-form__input registro-form__input--password${errors.password ? " registro-form__input--error" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="registro-form__toggle-password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <span className="registro-form__error">{errors.password.message}</span>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div className="registro-form__field">
        <label className="registro-form__label">{t('confirmPasswordLabel')}</label>
        <div className="registro-form__input-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder={t('confirmPasswordPlaceholder')}
            {...register("confirmar_password")}
            className={`registro-form__input registro-form__input--password${errors.confirmar_password ? " registro-form__input--error" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="registro-form__toggle-password"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmar_password && (
          <span className="registro-form__error">{errors.confirmar_password.message}</span>
        )}
      </div>

      {serverError && (
        <span className="registro-form__error">{serverError}</span>
      )}

      {/* Botón de submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="button button--large button--full-width"
      >
        {isSubmitting ? t('sendingCode') : t('submit')}
        {!isSubmitting && <ChevronRight size={16} />}
      </button>

    </form>
  );
}
