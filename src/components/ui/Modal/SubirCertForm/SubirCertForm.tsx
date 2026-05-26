"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus, FileText, CloudUpload, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { schemaCertificacion, validateCertificacionPdf, type CertificacionFormData, } from "../../../../schemas/zodSchemas";
import "../../../ui/Button/Button.css";
import "../CrearPublicacionForm/CrearPublicacionForm.css";
import "./SubirCertForm.css";

interface BaseCertFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CrearCertFormProps extends BaseCertFormProps {
  mode: "crear";
}

interface EditarCertFormProps extends BaseCertFormProps {
  mode: "editar";
  defaultValues?: Partial<CertificacionFormData> & { url_pdf?: string };
}

type SubirCertFormProps = CrearCertFormProps | EditarCertFormProps;

export default function SubirCertForm(props: SubirCertFormProps) {
  const t = useTranslations("certificacionForm");
  const { onSuccess, onCancel } = props;
  const isEditing = props.mode === "editar";
  const defaultValues = isEditing ? props.defaultValues : undefined;

  const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(
    defaultValues?.url_pdf ? t("fields.existingPdf") : null,
  );
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
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
      anio: defaultValues?.anio,
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

  const onSubmit = (_data: CertificacionFormData) => {
    if (!isEditing && !archivoPdf) {
      setErrorPdf(t("errors.pdfRequired"));
      return;
    }

    reset();
    setArchivoPdf(null);
    setNombreArchivo(null);
    onSuccess?.();
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
            <label className="crear-publicacion__label">{t("fields.year")}</label>
            <input
              type="number"
              placeholder={String(new Date().getFullYear())}
              {...register("anio", { valueAsNumber: true })}
              className={`crear-publicacion__input${errors.anio ? " crear-publicacion__input--error" : ""}`}
            />
            {errors.anio && (
              <span className="crear-publicacion__error">{errors.anio.message}</span>
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
              className={`crear-publicacion__upload-zone${dragOver ? " crear-publicacion__upload-zone--dragover" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) procesarArchivo(e.dataTransfer.files[0]);
              }}
            >
              <CloudUpload size={40} strokeWidth={1.5} className="crear-publicacion__upload-icon" />
              <p className="crear-publicacion__upload-text">{t("fields.uploadText")}</p>
              <p className="crear-publicacion__upload-hint">{t("fields.uploadHint")}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="crear-publicacion__upload-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) procesarArchivo(e.target.files[0]);
                }}
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

        <div className="crear-publicacion__footer">
          <button type="button" onClick={onCancel} className="crear-publicacion__btn-cancel">
            {t("actions.cancel")}
          </button>
          <button type="submit" className="button button--medium">
            {isEditing ? t("actions.saveChanges") : t("actions.create")}
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
