"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const router = useRouter();
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
        setServerError("El correo no es válido");
        return;
      }
      const respuesta = await apiClient.post<{ token: string; usuario: Usuario; rol: Rol }>(
        "/api/auth/register",
        {
          nombre: `${data.nombre} ${data.apellido}`.trim(),
          carnet,
          email_institucional: data.email_institucional,
          password: data.password,
          url_foto_perfil: data.url_foto_perfil || "https://i.pravatar.cc/150?u=vendedor",
          descripcion: data.descripcion || "Sin descripción",
        }
      );
      login(respuesta.usuario, respuesta.token, respuesta.rol);
      router.push("/");
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No fue posible registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="registro-form">

      {/* Nombre y Apellido */}
      <div className="registro-form__row">
        <div className="registro-form__field">
          <label className="registro-form__label">Nombre</label>
          <input
            type="text"
            placeholder="Michael"
            {...register("nombre")}
            className={`registro-form__input${errors.nombre ? " registro-form__input--error" : ""}`}
          />
          {errors.nombre && (
            <span className="registro-form__error">{errors.nombre.message}</span>
          )}
        </div>

        <div className="registro-form__field">
          <label className="registro-form__label">Apellido</label>
          <input
            type="text"
            placeholder="Pérez"
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
        <label className="registro-form__label">Correo electrónico</label>
        <input
          type="email"
          placeholder="per0000@uvg.edu.gt"
          {...register("email_institucional")}
          className={`registro-form__input${errors.email_institucional ? " registro-form__input--error" : ""}`}
        />
        {errors.email_institucional && (
          <span className="registro-form__error">{errors.email_institucional.message}</span>
        )}
      </div>

      {/* Contraseña */}
      <div className="registro-form__field">
        <label className="registro-form__label">Crea una contraseña</label>
        <div className="registro-form__input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Al menos 8 caracteres"
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
        <label className="registro-form__label">Confirmar contraseña</label>
        <div className="registro-form__input-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Al menos 8 caracteres"
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
        {isSubmitting ? "Registrando..." : "Continuar"}
        {!isSubmitting && <ChevronRight size={16} />}
      </button>

    </form>
  );
}