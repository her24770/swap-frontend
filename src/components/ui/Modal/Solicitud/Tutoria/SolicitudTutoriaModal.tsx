"use client";

import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ElementType,
  useId,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Send,
  X,
} from "lucide-react";
import {
  schemaSolicitudTutoria,
  type SolicitudTutoriaFormData,
} from "../../../../../schemas/zodSchemas";
import "../../../Button/Button.css";
import "../../Modal.css";
import "./SolicitudTutoriaModal.css";

interface CustomFieldProps {
  label: string;
  icon?: ElementType;
  error?: string;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & CustomFieldProps;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & CustomFieldProps;

interface ModalSolicitudTutoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SolicitudTutoriaFormData) => void | Promise<void>;
  tituloTutoria?: string;
}

function FormInput({ label, icon: Icon, error, id, className = "", ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className={`solicitud-tutoria__field ${className}`.trim()} htmlFor={inputId}>
      <span>
        {Icon && <Icon size={16} />} {label}
      </span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <small id={errorId} role="alert">{error}</small>}
    </label>
  );
}

function FormTextarea({ label, error, id, className = "", ...props }: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className={`solicitud-tutoria__field ${className}`.trim()} htmlFor={inputId}>
      <span>{label}</span>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <small id={errorId} role="alert">{error}</small>}
    </label>
  );
}

export default function ModalSolicitudTutoria({
  isOpen,
  onClose,
  onSubmit,
  tituloTutoria,
}: ModalSolicitudTutoriaProps) {
  const t = useTranslations("Tutoria");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudTutoriaFormData>({
    resolver: zodResolver(schemaSolicitudTutoria),
    defaultValues: { fecha: "", hora: "", lugar: "", tema: "" },
    mode: "onTouched",
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onNativeClose = () => handleClose();
    dialog.addEventListener("close", onNativeClose);

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    return () => dialog.removeEventListener("close", onNativeClose);
  }, [isOpen, handleClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="solicitud-tutoria"
    >
      <div className="solicitud-tutoria__content">
        <header className="solicitud-tutoria__header">
          <div>
            <p className="solicitud-tutoria__eyebrow">{t("nuevaSolicitud")}</p>
            <h2 id={titleId}>{t("solicitarTutoria")}</h2>
            {tituloTutoria && <p>{tituloTutoria}</p>}
          </div>
          <button
            type="button"
            className="solicitud-tutoria__close"
            onClick={handleClose}
            aria-label={t("cerrarModal")}
          >
            <X size={20} />
          </button>
        </header>

        <form
          noValidate
          className="solicitud-tutoria__form"
          onSubmit={handleSubmit(async (data) => {
            await onSubmit?.(data);
            handleClose();
          })}
        >
          <div className="solicitud-tutoria__schedule">
            <FormInput
              type="date"
              label={t("fecha")}
              icon={CalendarDays}
              error={errors.fecha?.message}
              {...register("fecha")}
            />
            <FormInput
              type="time"
              label={t("hora")}
              icon={Clock3}
              error={errors.hora?.message}
              {...register("hora")}
            />
          </div>
          
          <FormInput
            type="text"
            label={t("lugarEnlace")}
            icon={MapPin}
            placeholder={t("placeholderLugar")}
            error={errors.lugar?.message}
            {...register("lugar")}
          />
          
          <FormTextarea
            label={t("tema")}
            rows={4}
            placeholder={t("placeholderTema")}
            error={errors.tema?.message}
            {...register("tema")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="button button--medium button--full-width solicitud-tutoria__submit"
          >
            <Send size={16} />
            {isSubmitting ? t("enviando") : t("enviarSolicitud")}
          </button>
        </form>
      </div>
    </dialog>
  );
}