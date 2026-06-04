"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useRouter } from "../../../i18n/routing";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../lib/authResponse";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../hooks/useToast";
import type { AuthResponse } from "../../../types/usuario";
import "../../ui/Button/Button.css"
import {LogoCompleto} from "../../ui/Icono/Logo";
import "./LoginForm.css";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const t = useTranslations('login');
  const tValidation = useTranslations('login.validation');
  const tCommon = useTranslations('common');

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const response = await apiClient.post<AuthResponse>("/api/auth/login", {
        email_institucional: data.email,
        password: data.password,
      });
      const sesion = unwrapAuthResponse(response);
      login(sesion.usuario, sesion.rol);
      toast.success(t('toast.welcomeBack'));
      router.replace("/");
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError.status === 401
          ? t('toast.invalidCredentials')
          : apiError.message || t('toast.loginErrorFallback');

      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="login-form">
      <LogoCompleto className="login-form__brand"/>

      <h1 className="login-form__title">{t('title')}</h1>
      <p className="login-form__subtitle">
        {t('subtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form__fields">
        {/* Email */}
        <div className="login-form__field">
          <label className="login-form__label">{t('emailLabel')}</label>
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register("email", {
              required: tValidation('emailRequired'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: tValidation('emailInvalid'),
              },
            })}
            className={`login-form__input${errors.email ? " login-form__input--error" : ""}`}
          />
          {errors.email && (
            <span className="login-form__error">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="login-form__field">
          <div className="login-form__password-header">
            <label className="login-form__label">{t('passwordLabel')}</label>
            <Link href="/forgot-password" className="login-form__forgot">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="login-form__input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: tValidation('passwordRequired'),
              })}
              className={`login-form__input login-form__input--password${errors.password ? " login-form__input--error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="login-form__toggle-password"
              aria-label={t('togglePasswordAria')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="login-form__error">{errors.password.message}</span>
          )}
        </div>

        {serverError && (
          <span className="login-form__error">{serverError}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="button button--large button--full-width"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <div className="login-form__divider">
        <span>{t("footer.noAccount")}</span>
      </div>
      <Link href="/registro" className="login-form__register-btn">
        <UserPlus size={15} strokeWidth={1.8} aria-hidden />
        {t("footer.createAccount")}
      </Link>
    </div>
  );
}
