"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface RegisterFormData {
  nombre: string;
  apellido: string;
  carrera: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const inputClass = (hasError: boolean) =>
  clsx(
    "w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors",
    "focus:border-[#006b2d] focus:ring-1 focus:ring-[#006b2d]",
    hasError ? "border-red-400" : "border-gray-300"
  );

export default function RegistroForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    // TODO: conectar con el backend
    console.log(data);
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
            {...register("nombre", { required: "Requerido" })}
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
            {...register("apellido", { required: "Requerido" })}
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
          placeholder="ejemplo@uvg.edu.gt"
          {...register("email", {
            required: "El correo es requerido",
            pattern: {
              value: /^[^\s@]+@uvg\.edu\.gt$/,
              message: "Debe ser un correo @uvg.edu.gt",
            },
          })}
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
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
            {...register("password", {
              required: "La contraseña es requerida",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            })}
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
            {...register("confirmPassword", {
              required: "Confirma tu contraseña",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
            className={clsx(inputClass(!!errors.confirmPassword), "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
        )}
      </div>

      {/* Submit */}
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