"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus, FileText, CloudUpload, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { schemaCertificacion, validateCertificacionPdf, type CertificacionFormData } from "../../../../schemas/zodSchemas";
import { useTodasEtiquetas } from "../../../../hooks/useTodasEtiquetas";
import "../../../ui/Button/Button.css";
import "../CrearPublicacionForm/CrearPublicacionForm.css";
import "./SubirCertForm.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface BaseCertFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CrearCertFormProps extends BaseCertFormProps {
  mode: "crear";
}

interface EditarCertFormProps extends BaseCertFormProps {
  mode: "editar";
  defaultValues?: Partial<CertificacionFormData> & { ruta_pdf?: string };
}

type SubirCertFormProps = CrearCertFormProps | EditarCertFormProps;

export default function SubirCertForm(props: SubirCertFormProps) {
  const t = useTranslations("certificacionForm");
  const { onSuccess, onCancel } = props;
  const isEditing = props.mode === "editar";
  const defaultValues = isEditing ? props.defaultValues : undefined;

  const { etiquetas } = useTodasEtiquetas();

  const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(
    defaultValues?.ruta_pdf ? t("fields.existingPdf") : null,
  );
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertificacionFormData>({
    resolver: zodResolver(schemaCertificacion),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      lugar_emision: defaultValues?.lugar_emision ?? "",
      id_etiqueta: defaultValues?.id_etiqueta ?? undefined,
    },
  });

  const procesarArchivo = (file: File) => {
    const validationError = validateCertificacionPdf(file);
    if (validationError) {
      setErrorPdf(validationError);
      return;
    }
    setErrorPdf(null);
    setArchivoPdf(file);
    setNombreArchivo(file.name);
  };

  const removerPdf = () => {
    setArchivoPdf(null);
    setNombreArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: CertificacionFormData) => {
    if (!isEditing && !archivoPdf) {
      setErrorPdf(t("errors.pdfRequired"));
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nombre", data.nombre);
      formData.append("lugar_emision", data.lugar_emision);
      formData.append("id_etiqueta", String(data.id_etiqueta));
      if (archivoPdf) formData.append("pdf", archivoPdf);

      const res = await fetch(`${BASE_URL}/api/certificacion/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);

      reset();
      setArchivoPdf(null);
      setNombreArchivo(null);
      onSuccess?.();
    } catch (err: any) {
      setServerError(err.message || "No fue posible guardar la certificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crear-publicacion">
      <div className="crear-publicacion__header">
        <div className="crear-publicacion__header-icon">
          <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
        </div>
        <h2 className="crear-publicacion__title">
          {isEditing ? t("titleEdit") : t("titleCreate")}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="crear-publicacion__fields">

          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.name")}</label>
            <input
              type="text"
              placeholder={t("fields.namePlaceholder")}
              {...register("nombre")}
              className={`crear-publicacion__input${errors.nombre ? " crear-publicacion__input--error" : ""}`}
            />
            {errors.nombre && (
              <span className="crear-publicacion__error">{errors.nombre.message}</span>
            )}
          </div>

          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.lugarEmision")}</label>
            <input
              type="text"
              placeholder={t("fields.lugarEmisionPlaceholder")}
              {...register("lugar_emision")}
              className={`crear-publicacion__input${errors.lugar_emision ? " crear-publicacion__input--error" : ""}`}
            />
            {errors.lugar_emision && (
              <span className="crear-publicacion__error">{errors.lugar_emision.message}</span>
            )}
          </div>

          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.etiqueta")}</label>
            <select
              {...register("id_etiqueta")}
              className={`crear-publicacion__input${errors.id_etiqueta ? " crear-publicacion__input--error" : ""}`}
            >
              <option value="">{t("fields.etiquetaPlaceholder")}</option>
              {etiquetas.map((e) => (
                <option key={e.id_etiqueta} value={e.id_etiqueta}>
                  {e.nombre}
                </option>
              ))}
            </select>
            {errors.id_etiqueta && (
              <span className="crear-publicacion__error">{errors.id_etiqueta.message}</span>
            )}
          </div>

          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">
              {t("fields.pdf")}
              {isEditing && (
                <span className="subir-cert-form__label-hint">{t("fields.pdfEditHint")}</span>
              )}
            </label>

            <div
              className={`crear-publicacion__upload-zone${dragOver ? " crear-publicacion__upload-zone--dragover" : ""}${nombreArchivo ? " crear-publicacion__upload-zone--disabled" : ""}`}
              onClick={() => { if (!nombreArchivo) fileInputRef.current?.click(); }}
              onDragOver={(e) => { e.preventDefault(); if (!nombreArchivo) setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!nombreArchivo && e.dataTransfer.files?.[0]) procesarArchivo(e.dataTransfer.files[0]);
              }}
            >
              <CloudUpload size={40} strokeWidth={1.5} className="crear-publicacion__upload-icon" />
              <p className="crear-publicacion__upload-text">
                {nombreArchivo ? t("fields.uploadMaxReached") : t("fields.uploadText")}
              </p>
              <p className="crear-publicacion__upload-hint">{t("fields.uploadHint")}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="crear-publicacion__upload-input"
                onChange={(e) => { if (e.target.files?.[0]) procesarArchivo(e.target.files[0]); }}
              />
            </div>

            {errorPdf && <span className="crear-publicacion__error">{errorPdf}</span>}

            {nombreArchivo && (
              <div className="subir-cert-form__pdf-file">
                <FileText size={20} strokeWidth={1.8} className="subir-cert-form__pdf-icon" aria-hidden />
                <span className="subir-cert-form__pdf-name" title={nombreArchivo}>
                  {nombreArchivo}
                </span>
                <button
                  type="button"
                  onClick={removerPdf}
                  className="subir-cert-form__pdf-remove"
                  aria-label={t("fields.removePdfAria")}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

        </div>

        {serverError && <p className="crear-publicacion__server-error">{serverError}</p>}

        <div className="crear-publicacion__footer">
          <button type="button" onClick={onCancel} className="crear-publicacion__btn-cancel">
            {t("actions.cancel")}
          </button>
          <button type="submit" disabled={isSubmitting} className="button button--medium">
            {isSubmitting
              ? t("actions.saving")
              : isEditing ? t("actions.saveChanges") : t("actions.create")}
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
