"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Star } from "lucide-react";
import { useTranslations } from 'next-intl';
import { usePerspectivaInterna } from "../../../../../context/PerspectivaInternaContext";

// Esquema e inputs compartidos de Zod y tu Hook de persistencia
import { schemaResena, ResenaInput } from "../../../../../schemas/schemaResenas";
import { useResena } from "../../../../../hooks/useResena";

import "../../../../ui/Button/Button.css";
import "./CommentForm.css";

interface CommentFormProps {
  targetName: string;
  idReceptor: number;
  onSuccess?: () => void; 
  onCancel: () => void;
}

export default function CommentForm({ targetName, idReceptor, onSuccess, onCancel }: CommentFormProps) {
  const t = useTranslations('comments.form');
  const tActions = useTranslations('common.actions');
  

  const { crearNuevaResena, loading, error: apiError } = useResena();
  const {activeProfileMode } = usePerspectivaInterna();

  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue, 
    watch,
    reset,
    formState: { errors },
  } = useForm<ResenaInput>({
    resolver: zodResolver(schemaResena),
    defaultValues: {
      id_receptor: idReceptor,
      tipo_resena: activeProfileMode,
      calificacion: 0, 
      contenido: "",
    },
  });


  register("calificacion"); 
  useEffect(() => {
    setValue("id_receptor", idReceptor, { shouldValidate: false });
  }, [idReceptor, setValue]);

  useEffect(() => {
    if (activeProfileMode) {
      setValue("tipo_resena", activeProfileMode, { shouldValidate: false });
    }
  }, [activeProfileMode, setValue]);

  const currentRating = watch("calificacion");

  const onSubmitForm = async (data: ResenaInput) => {
    const resultado = await crearNuevaResena(data);
    
    if (resultado) {
      reset(); 
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="comment-form">
      
      <input type="hidden" {...register("id_receptor", { valueAsNumber: true })} />
      <input type="hidden" {...register("tipo_resena")} />

      {/* Selector interactivo de Estrellas */}
      <div className="comment-form__stars-container">
        <div className="comment-form__stars">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isActive = (hoverRating || currentRating) >= starValue;

            return (
              <button
                key={i}
                type="button"
                className={`comment-form__star${isActive ? " comment-form__star--active" : ""}`}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => {
                  if (!loading) {
                    // ── SOLUCIÓN ──
                    // Setea el número nativo y fuerza a Zod a validar en tiempo real
                    setValue("calificacion", starValue, { shouldValidate: true });
                  }
                }}
                disabled={loading}
                aria-label={t('starsAria', { count: starValue })}
              >
                <Star size={24} fill={isActive ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
        {errors.calificacion && (
          <p className="text-red-500 text-xs font-medium mt-1">{errors.calificacion.message}</p>
        )}
      </div>

      {/* Entrada del texto de la Reseña */}
      <div className="comment-form__textarea-container">
        <textarea
          {...register("contenido")}
          className={`comment-form__textarea ${errors.contenido ? "comment-form__textarea--error" : ""}`}
          placeholder={t('placeholder', { name: targetName })}
          rows={5}
          disabled={loading}
        />
        {errors.contenido && (
          <p className="text-red-500 text-xs font-medium mt-1">{errors.contenido.message}</p>
        )}
      </div>

      {/* Feedback de Errores de la API de SWAP */}
      {apiError && (
        <div className="p-3 mb-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
          {apiError}
        </div>
      )}

      {/* Footer y Botones de Acción */}
      <div className="comment-form__footer">
        <div className="comment-form__actions" style={{ marginLeft: "auto" }}> 
          <button
            type="button"
            className="button button--medium button--danger"
            onClick={onCancel}
            disabled={loading}
          >
            {tActions('cancel')}
          </button>
          <button
            type="submit"
            className="button button--medium"
            disabled={loading}
          >
            {loading ? tActions('sending') || "Enviando..." : tActions('send')}{" "}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}