"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    // TODO: conectar con el backend
    console.log(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-8">
      {/* Logo */}
      <span className="text-[#006b2d] font-bold text-base tracking-wide">
        SWAP
      </span>

      {/* Título */}
      <h1 className="text-2xl font-semibold text-gray-900 mt-2 mb-1">
        Iniciar Sesión
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        ¿Eres nuevo? Ingresa tus credenciales para ingresar.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo no válido",
              },
            })}
            className={clsx(
              "border rounded-md px-3 py-2 text-sm outline-none transition-colors",
              "focus:border-[#006b2d] focus:ring-1 focus:ring-[#006b2d]",
              errors.email ? "border-red-400" : "border-gray-300"
            )}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#006b2d] hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "Mínimo 6 caracteres",
                },
              })}
              className={clsx(
                "w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors pr-10",
                "focus:border-[#006b2d] focus:ring-1 focus:ring-[#006b2d]",
                errors.password ? "border-red-400" : "border-gray-300"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "w-full bg-[#006b2d] text-white font-medium py-2.5 rounded-md text-sm transition-colors mt-1",
            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#005a25]"
          )}
        >
          {isSubmitting ? "Ingresando..." : "Continuar"}
        </button>
      </form>

      {/* Registro */}
      <p className="text-sm text-center text-gray-500 mt-5">
        No tienes una cuenta?{" "}
        <Link href="/register" className="text-[#006b2d] font-medium hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}