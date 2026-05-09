"use client";

import { useEffect, useState, useRef} from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronRight, ChevronDown, Check, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToast } from "../../../hooks/useToast";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { schemaRegistro, type RegistroFormData } from "../../../schemas/zodSchemas";
import { useAuthStore, type Rol, type Usuario } from "../../../store/authStore";
import { TAGS_MATERIAS } from "../../../lib/tags";
import "../../ui/Button/Button.css"
import "./RegistroForm.css";
import { serializeUseCacheCacheStore } from "next/dist/server/resume-data-cache/cache-store";

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
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTags((prev) => {
      if (prev.includes(id)) {
        return prev.filter((tagId) => tagId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const triggerLabel =
    selectedTags.length === 0
      ? t('tagsPlaceholder')
      : `${selectedTags.length} ${selectedTags.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"}`;

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
      url_foto_perfil: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL ?? "",
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
        url_foto_perfil: data.url_foto_perfil || process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || "",
        descripcion: data.descripcion || "Sin descripción",
        tags: selectedTags,
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

      {/*tags del perfil*/}
      <div className="registro-form__field">
        <label className = "registro-form__label">{t('tagsLabel')}</label>
        <div ref={dropdownRef} className="registro-form__tags-dropdown">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !(prev))}
            className= {[
              "registro-form__tags-trigger",
              selectedTags.length > 0 ? "registro-form__tags-trigger--has-value" : "",
              dropdownOpen ? "registro-form__tags-trigger--open" : "",
              
            ].join(" ")}>
              <span>{triggerLabel}</span>
              <ChevronDown size={16} className={`registro-form__tags-chevron${dropdownOpen ? " registro-form__tags-chevron--open" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="registro-form__tags-menu">
                {TAGS_MATERIAS.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <button 
                    key= {tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`registro-form__tags-option${selected ? " registro-form__tags-option--selected" : ""}`}
                    >
                      <span className={`registro-form__tags-checkbox${selected ? " registro-form__tags-checkbox--checked" : ""}`}>
                        {selected && <Check size={11} strokeWidth={3} color="white" />}
                      </span>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
        </div>

          {selectedTags.length > 0 && (
            <div className="registro-form__tags-list">
              {selectedTags.map((id) => {
                const tag = TAGS_MATERIAS.find((t) => t.id === id);
                return tag ?(
                  <span key={id} className="registro-form__tag">
                    {tag.name}
                    <button 
                    type="button"
                    onClick={()=> toggleTag(id)}
                    className="registro-form__tag-remove">
                      <X size={11} strokeWidth = {2.5} />
                    </button>
                  </span>
                ): null;
              })}
            </div>
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