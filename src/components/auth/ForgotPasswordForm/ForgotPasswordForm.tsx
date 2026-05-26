"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useToast } from "../../../hooks/useToast";
import "../../ui/Button/Button.css";
import { LogoCompleto } from "../../ui/Icono/Logo";
import "../LoginForm/LoginForm.css";
import "./ForgotPasswordForm.css";

type Step = "email" | "code" | "password";

export default function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleEmailSubmit = async () => {
    await apiClient.post("/api/auth/forgot-password", { email: normalizedEmail });
    toast.success(t("toast.codeSent"));
    setStep("code");
  };

  const handleCodeSubmit = async () => {
    await apiClient.post("/api/auth/verify-reset-code", { email: normalizedEmail, code });
    toast.success(t("toast.codeValid"));
    setStep("password");
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setServerError(t("validation.passwordMismatch"));
      return;
    }

    await apiClient.post("/api/auth/reset-password", {
      email: normalizedEmail,
      code,
      newPassword,
    });
    toast.success(t("toast.passwordUpdated"));
    router.push("/login");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setIsSubmitting(true);

    try {
      if (step === "email") await handleEmailSubmit();
      if (step === "code") await handleCodeSubmit();
      if (step === "password") await handlePasswordSubmit();
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.message || t("toast.errorFallback");
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form forgot-password-form">
      <LogoCompleto className="login-form__brand" />

      <h1 className="login-form__title">{t("title")}</h1>
      <p className="login-form__subtitle">{t(`steps.${step}.subtitle`)}</p>

      <form onSubmit={onSubmit} noValidate className="login-form__fields">
        {step === "email" && (
          <div className="login-form__field">
            <label className="login-form__label">{t("emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              className="login-form__input"
            />
          </div>
        )}

        {step === "code" && (
          <div className="login-form__field">
            <label className="login-form__label">{t("codeLabel")}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("codePlaceholder")}
              required
              className="login-form__input forgot-password-form__code"
            />
          </div>
        )}

        {step === "password" && (
          <>
            <div className="login-form__field">
              <label className="login-form__label">{t("newPasswordLabel")}</label>
              <div className="login-form__input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className="login-form__input login-form__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="login-form__toggle-password"
                  aria-label={t("togglePasswordAria")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-form__field">
              <label className="login-form__label">{t("confirmPasswordLabel")}</label>
              <div className="login-form__input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className="login-form__input login-form__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="login-form__toggle-password"
                  aria-label={t("togglePasswordAria")}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </>
        )}

        {serverError && <span className="login-form__error">{serverError}</span>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="button button--large button--full-width"
        >
          {isSubmitting ? t(`steps.${step}.submitting`) : t(`steps.${step}.submit`)}
        </button>
      </form>

      <p className="login-form__footer">
        <Link href="/login" className="login-form__register-link">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
