"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "../../../i18n/routing";
import { moderadorService } from "../../../services/moderadorService";
import { useModeradorAuthStore } from "../../../store/moderadorAuthStore";
import { useToast } from "../../../hooks/useToast";
import type { ApiError } from "../../../lib/apiClient";
import "../../ui/Button/Button.css";
import { LogoCompleto } from "../../ui/Icono/Logo";
import "./LoginModeradorForm.css";

interface LoginModeradorFormData {
  usuario: string;
  password: string;
}

export default function LoginModeradorForm() {
  const t = useTranslations("moderacion.login");
  const tValidation = useTranslations("moderacion.login.validation");

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const login = useModeradorAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginModeradorFormData>();

  const onSubmit = async (data: LoginModeradorFormData) => {
    try {
      setServerError(null);
      const sesion = await moderadorService.iniciarSesion(data);
      login(sesion.moderador);
      toast.success(t("toast.welcomeBack"));
      router.replace("/moderacion");
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.status === 401
          ? t("toast.invalidCredentials")
          : apiError.message || t("toast.loginErrorFallback");

      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="login-moderador-form">
      <LogoCompleto className="login-moderador-form__brand" />

      <h1 className="login-moderador-form__title">{t("title")}</h1>
      <p className="login-moderador-form__subtitle">{t("subtitle")}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-moderador-form__fields">
        <div className="login-moderador-form__field">
          <label className="login-moderador-form__label">{t("usuarioLabel")}</label>
          <input
            type="text"
            placeholder={t("usuarioPlaceholder")}
            {...register("usuario", {
              required: tValidation("usuarioRequired"),
            })}
            className={`login-moderador-form__input${errors.usuario ? " login-moderador-form__input--error" : ""}`}
          />
          {errors.usuario && (
            <span className="login-moderador-form__error">{errors.usuario.message}</span>
          )}
        </div>

        <div className="login-moderador-form__field">
          <label className="login-moderador-form__label">{t("passwordLabel")}</label>
          <div className="login-moderador-form__input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: tValidation("passwordRequired"),
              })}
              className={`login-moderador-form__input login-moderador-form__input--password${errors.password ? " login-moderador-form__input--error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="login-moderador-form__toggle-password"
              aria-label={t("togglePasswordAria")}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="login-moderador-form__error">{errors.password.message}</span>
          )}
        </div>

        {serverError && (
          <span className="login-moderador-form__error">{serverError}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="button button--large button--full-width"
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
