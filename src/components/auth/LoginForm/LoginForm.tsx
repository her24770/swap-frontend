"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../hooks/useToast";
import type { AuthResponse } from "../../../types/usuario";
import "../../ui/Button/Button.css"
import "./LoginForm.css";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
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
      login(response.usuario, response.rol);
      toast.success("¡Bienvenido de nuevo!");
      router.push("/");
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "No fue posible iniciar sesión");
    }
  };

  return (
    <div className="login-form">
      <span className="login-form__brand">SWAP</span>

      <h1 className="login-form__title">Iniciar Sesión</h1>
      <p className="login-form__subtitle">
        ¿Eres nuevo? Ingresa tus credenciales para ingresar.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form__fields">
        {/* Email */}
        <div className="login-form__field">
          <label className="login-form__label">Correo electrónico</label>
          <input
            type="email"
            placeholder="ejemplo@uvg.edu.gt"
            {...register("email", {
              required: "El correo es requerido",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo no válido",
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
            <label className="login-form__label">Contraseña</label>
            <Link href="/forgot-password" className="login-form__forgot">
              Olvidé mi contraseña
            </Link>
          </div>
          <div className="login-form__input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              className={`login-form__input login-form__input--password${errors.password ? " login-form__input--error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="login-form__toggle-password"
              aria-label="Toggle password visibility"
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
          {isSubmitting ? "Ingresando..." : "Continuar"}
        </button>
      </form>

      <p className="login-form__footer">
        No tienes una cuenta?{" "}
        <Link href="/registro" className="login-form__register-link">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}