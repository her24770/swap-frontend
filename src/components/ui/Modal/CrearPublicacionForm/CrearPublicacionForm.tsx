"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePlus, ChevronDown, Check, X, CloudUpload, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormCrearPublicacion, useFormEditarPublicacion, type UseFormEditarPublicacionReturn } from "../../../../hooks/useFormPublicacion";
import { useTodasEtiquetas } from "../../../../hooks/useTodasEtiquetas";
import { useEstados } from "../../../../hooks/useEstados";
import "../../../ui/Button/Button.css";
import "./CrearPublicacionForm.css";
import { CrearPublicacionFormData, EditarPublicacionFormData, type TipoPublicacion } from "../../../../schemas/zodSchemas";
import { UseFormReturn } from "react-hook-form";

type FormFields = CrearPublicacionFormData & Pick<EditarPublicacionFormData, "estado">;

interface BasePublicacionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CrearPublicacionFormProps extends BasePublicacionFormProps {
  mode: "crear";
  tipoPublicacion: TipoPublicacion;
}

interface EditarPublicacionFormProps extends BasePublicacionFormProps {
  mode: "editar";
  publicacionId: number;
  defaultValues?: Partial<EditarPublicacionFormData>;
  imagenesExistentes?: string[];
}

type PublicacionFormProps = CrearPublicacionFormProps | EditarPublicacionFormProps;

export default function CrearPublicacionForm(props: PublicacionFormProps) {
  const t = useTranslations("publicacionForm");
  const tTags = useTranslations("common.tags");
  const testado = useTranslations("posts.estado");

  const { onSuccess, onCancel} =props;
  const isEditing = props.mode === "editar";
  const tipoPublicacionSeleccionada = isEditing
    ? ((props as EditarPublicacionFormProps).defaultValues?.tipo_publicacion ?? "material")
    : props.tipoPublicacion;
  const createHook = useFormCrearPublicacion(tipoPublicacionSeleccionada);
  const editHook = useFormEditarPublicacion(
    isEditing ? props.publicacionId : 0,
    isEditing ? props.defaultValues : undefined,
    isEditing ? (props as EditarPublicacionFormProps).imagenesExistentes ?? [] : []
  );

  const { etiquetas: etiquetasBD } = useTodasEtiquetas();
  const tipoEditar = isEditing ? (props as { defaultValues?: { tipo_publicacion?: string } }).defaultValues?.tipo_publicacion ?? "material" : "material";
  const estadosDisponibles = useEstados(tipoEditar);

  const { resetForm } = createHook;

  const {
    form,
    onSubmit,
    isSubmitting,
    serverError,
    isSuccess,
    imagePreviews,
    addImages,
    removeImage
  } = isEditing ? editHook : createHook;

  const { imagenesExistentes = [], removeExistingImage } = isEditing
    ? (editHook as UseFormEditarPublicacionReturn)
    : { imagenesExistentes: [], removeExistingImage: undefined };

  const { register, formState: { errors }, setValue, watch } = form as UseFormReturn<FormFields>;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategorias: number[] = watch("categorias") ?? [];

  // Cierra el dropdown al clickear fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notifica al padre cuando la creación fue exitosa
  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  const toggleCategoria = (id: number) => {
    const next = selectedCategorias.includes(id)
      ? selectedCategorias.filter((c) => c !== id)
      : [...selectedCategorias, id];
    setValue("categorias", next, { shouldValidate: true, shouldDirty: true });
  };

  const triggerLabel =
    selectedCategorias.length === 0
      ? t("fields.categoryTriggerEmpty")
      : selectedCategorias.length === 1
        ? t("fields.categoryTriggerOne")
        : t("fields.categoryTriggerMany", { count: selectedCategorias.length });

  const tipoPublicacionLabel =
    tipoPublicacionSeleccionada === "material"
      ? tTags("material")
      : tipoPublicacionSeleccionada === "tutoria"
        ? tTags("tutoria")
        : tTags("negocio");

  return (

    <div className="crear-publicacion">
      <div className="crear-publicacion__header">
        <div className="crear-publicacion__header-icon">
          <SquarePlus size={18} strokeWidth={1.8} />
        </div>
        <h2 className="crear-publicacion__title">{isEditing ? t("titleEdit") : t("titleCreate")}</h2>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="crear-publicacion__fields">

          {isEditing && (
            <div className="crear-publicacion__field">
              <label className="crear-publicacion__label">{t("fields.status")}</label>
              <select {...register("estado")} className="crear-publicacion__select">
                {estadosDisponibles.map((e) => (
                  <option key={e.id_estado} value={e.estado}>{testado(e.estado)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Título */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.productName")}</label>
            <input
              type="text"
              placeholder={t("fields.productNamePlaceholder")}
              {...register("titulo")}
              className={`crear-publicacion__input${errors.titulo ? " crear-publicacion__input--error" : ""}`}
            />
            {errors.titulo && <span className="crear-publicacion__error">{errors.titulo.message}</span>}
          </div>

          {/* Descripción */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.description")}</label>
            <textarea
              placeholder={t("fields.descriptionPlaceholder")}
              {...register("descripcion")}
              className={`crear-publicacion__textarea${errors.descripcion ? " crear-publicacion__textarea--error" : ""}`}
            />
            {errors.descripcion && <span className="crear-publicacion__error">{errors.descripcion.message}</span>}
          </div>

          {/* Precio */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.price")}</label>
            <div className="crear-publicacion__price-wrapper">
              <span className="crear-publicacion__price-prefix">Q</span>
              <input
                type="text"
                placeholder="0.00"
                inputMode="decimal"
                {...register("precio")}
                className={`crear-publicacion__input crear-publicacion__input--price${errors.precio ? " crear-publicacion__input--error" : ""}`}
              />
            </div>
            {errors.precio && <span className="crear-publicacion__error">{errors.precio.message}</span>}
          </div>

          {/* Tipo de publicación */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.type")}</label>
            <div className="crear-publicacion__readonly-value" aria-readonly="true">
              {tipoPublicacionLabel}
            </div>
          </div>

          {/* Categorías */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.category")}</label>
            <div className="crear-publicacion__categories-dropdown" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={[
                  "crear-publicacion__categories-trigger",
                  selectedCategorias.length > 0 ? "crear-publicacion__categories-trigger--has-value" : "",
                  dropdownOpen ? "crear-publicacion__categories-trigger--open" : "",
                  errors.categorias ? "crear-publicacion__categories-trigger--error" : "",
                ].join(" ")}
              >
                <span>{triggerLabel}</span>
                <ChevronDown
                  size={16}
                  className={`crear-publicacion__categories-chevron${dropdownOpen ? " crear-publicacion__categories-chevron--open" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="crear-publicacion__categories-menu">
                  {etiquetasBD.map((etiqueta) => {
                    const selected = selectedCategorias.includes(etiqueta.id_etiqueta);
                    return (
                      <button
                        key={etiqueta.id_etiqueta}
                        type="button"
                        onClick={() => toggleCategoria(etiqueta.id_etiqueta)}
                        className={`crear-publicacion__categories-option${selected ? " crear-publicacion__categories-option--selected" : ""}`}
                      >
                        <span className={`crear-publicacion__categories-checkbox${selected ? " crear-publicacion__categories-checkbox--checked" : ""}`}>
                          {selected && <Check size={11} strokeWidth={3} color="white" />}
                        </span>
                        {etiqueta.nombre}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCategorias.length > 0 && (
              <div className="crear-publicacion__categories-tags">
                {selectedCategorias.map((id) => {
                  const etiqueta = etiquetasBD.find((e) => e.id_etiqueta === id);
                  return etiqueta ? (
                    <span key={id} className="crear-publicacion__categories-tag">
                      {etiqueta.nombre}
                      <button
                        type="button"
                        onClick={() => toggleCategoria(id)}
                        className="crear-publicacion__categories-tag-remove"
                        aria-label={t("fields.removeTagAria", { tag: etiqueta.nombre })}
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {errors.categorias && (
              <span className="crear-publicacion__error">{errors.categorias.message}</span>
            )}
          </div>

          {/* Destacado */}
          <div className="crear-publicacion__field">
            <div className="crear-publicacion__toggle-row">
              <label className="crear-publicacion__toggle">
                <input type="checkbox" {...register("destacado")} className="crear-publicacion__toggle-input" />
                <span className="crear-publicacion__toggle-track" />
              </label>
              <span className="crear-publicacion__toggle-label">{t("fields.featured")}</span>
            </div>
          </div>

          {/* Imagen */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">{t("fields.photo")}</label>
            <div
              className={`crear-publicacion__upload-zone${dragOver ? " crear-publicacion__upload-zone--dragover" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addImages(e.dataTransfer.files);
              }}
            >
              <CloudUpload size={40} strokeWidth={1.5} className="crear-publicacion__upload-icon" />
              <p className="crear-publicacion__upload-text">{t("fields.uploadText")}</p>
              <p className="crear-publicacion__upload-hint">{t("fields.uploadHint")}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="crear-publicacion__upload-input"
                onChange={(e) => { if (e.target.files) addImages(e.target.files); }}
              />
            </div>

            {(imagenesExistentes.length > 0 || imagePreviews.length > 0) && (
              <div className="crear-publicacion__previews">
                {imagenesExistentes.map((url) => (
                  <div key={url} className="crear-publicacion__preview-item">
                    <img src={url} alt="imagen-existente" className="crear-publicacion__preview-img" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage?.(url)}
                      className="crear-publicacion__preview-remove"
                      aria-label={t("fields.removeImageAria")}
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((src, i) => (
                  <div key={i} className="crear-publicacion__preview-item">
                    <img src={src} alt={`preview-${i}`} className="crear-publicacion__preview-img" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="crear-publicacion__preview-remove"
                      aria-label={t("fields.removeImageAria")}
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {serverError && <p className="crear-publicacion__server-error">{serverError}</p>}

        <div className="crear-publicacion__footer">
          <button
            type="button"
            onClick={() => { if (!isEditing) resetForm(); props.onCancel?.(); }}
            className="crear-publicacion__btn-cancel"
          >
            {t("actions.cancel")}
          </button>
          <button type="submit" disabled={isSubmitting} className="button button--medium">
            {isSubmitting 
              ? (isEditing ? t("actions.saving") : t("actions.publishing"))
              : (isEditing ? t("actions.saveChanges") : t("actions.create"))
            } 
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
