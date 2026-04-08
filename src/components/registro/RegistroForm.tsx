"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { apiClient, type ApiError } from "../../lib/apiClient";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaRegistro, type RegistroFormData } from "../../schemas/zodSchemas";

const inputClass = (hasError: boolean) =>
  clsx(
    "w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors",
    "focus:border-[#006b2d] focus:ring-1 focus:ring-[#006b2d]",
    hasError ? "border-red-400" : "border-gray-300"
  );

export const extractCarnetFromEmail = (email: string): number | null => {
  // Verificar que el email tenga el formato esperado
  const match = email.match(/^[a-zA-Z]+(\d+)@uvg\.edu\.gt$/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

export default function RegistroForm() {
  const router = useRouter();
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

      await apiClient.post("/api/auth/register", {
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        carnet,
        email_institucional: data.email_institucional,
        password: data.password,
        url_foto_perfil: data.url_foto_perfil || "https://i.pravatar.cc/150?u=vendedor",
        descripcion: data.descripcion || "Sin descripción",
      });

      alert(`Registro exitoso. Nuevo usuario creado con el email ${data.email_institucional}\nRedirigiendo a login...`);
      router.push("/login");
      router.refresh();

    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No fue posible registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

      {/* Nombre y Apellido */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            placeholder="Michael"
            {...register("nombre")}
            className={inputClass(!!errors.nombre)}
          />
          {errors.nombre && (
            <span className="text-xs text-red-500">{errors.nombre.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-700">Apellido</label>
          <input
            type="text"
            placeholder="Pérez"
            {...register("apellido")}
            className={inputClass(!!errors.apellido)}
          />
          {errors.apellido && (
            <span className="text-xs text-red-500">{errors.apellido.message}</span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="tan25987@uvg.edu.gt"
          {...register("email_institucional")}
          className={inputClass(!!errors.email_institucional)}
        />
        {errors.email_institucional && (
          <span className="text-xs text-red-500">{errors.email_institucional.message}</span>
        )}
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Crea una contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Al menos 8 caracteres"
            {...register("password")}
            className={clsx(inputClass(!!errors.password), "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">{errors.password.message}</span>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Al menos 8 caracteres"
            {...register("confirmar_password")}
            className={clsx(inputClass(!!errors.confirmar_password), "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmar_password && (
          <span className="text-xs text-red-500">{errors.confirmar_password.message}</span>
        )}
      </div>

      {/* Submit */}
      {serverError && (
        <span className="text-xs text-red-500">{serverError}</span>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          "w-full bg-[#006b2d] text-white font-medium py-2.5 rounded-md text-sm transition-colors mt-1",
          "flex items-center justify-center gap-2",
          isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#005a25]"
        )}
      >
        {isSubmitting ? "Registrando..." : "Continuar"}
        {!isSubmitting && <ChevronRight size={16} />}
      </button>

    </form>
  );
}