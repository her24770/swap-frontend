"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToast } from "../../../hooks/useToast";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { schemaRegistro, type RegistroFormData } from "../../../schemas/zodSchemas";
import { useAuthStore, type Rol, type Usuario } from "../../../store/authStore";
import "../../ui/Button/Button.css"
import "./RegistroForm.css";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(schemaRegistro),
    defaultValues: {
      nombre: "",
      apellido: "",
      email_institucional: "",
      password: "",
      confirmar_password: "",
      url_foto_perfil: "https://i.pravatar.cc/150?u=vendedor",
      descripcion: "Sin descripción",
    },
  });

  const onSubmit = async (data: RegistroFormData) => {
    try {
      setServerError(null);
      const carnet = extractCarnetFromEmail(data.email_institucional);
      if (!carnet) {
        setServerError(t('emailInvalid'));
        return;
      }
      const respuesta = await apiClient.post<{ usuario: Usuario; rol: Rol }>("/api/auth/register", {
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        carnet,
        email_institucional: data.email_institucional,
        password: data.password,
        url_foto_perfil: data.url_foto_perfil || "https://i.pravatar.cc/150?u=vendedor",
        descripcion: data.descripcion || "Sin descripción",
      });
      login(respuesta.usuario, respuesta.rol);
      router.push("/?registered=true");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || t('toast.errorFallback'));
    }
  };

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
          {...register("email_institucional")}
          className={`registro-form__input${errors.email_institucional ? " registro-form__input--error" : ""}`}
        />
        {errors.email_institucional && (
          <span className="registro-form__error">{errors.email_institucional.message}</span>
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
        {isSubmitting ? t('submitting') : t('submit')}
        {!isSubmitting && <ChevronRight size={16} />}
      </button>

    </form>
  );
}