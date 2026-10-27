"use client";

import { useEffect } from "react";
import { SquarePlus, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormCrearPublicacion, useFormEditarPublicacion, type UseFormEditarPublicacionReturn } from "../../../../hooks/useFormPublicacion";
import { useTodasEtiquetas } from "../../../../hooks/useTodasEtiquetas";
import { useEstados } from "../../../../hooks/useEstados";
import CategoriasSelector from "./CategoriasSelector";
import ImagenesUploader from "./ImagenesUploader";
import TipoPublicacionField from "./TipoPublicacionField";
import "../../../ui/Button/Button.css";
import "../FormularioModal.css";
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
  tipoPublicacion?: TipoPublicacion;
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
  const testado = useTranslations("posts.estado");

  const { onSuccess } = props;
  const isEditing = props.mode === "editar";
  const tipoPublicacionProp = !isEditing ? (props as CrearPublicacionFormProps).tipoPublicacion : undefined;
  const tipoPublicacionSeleccionada = isEditing
    ? ((props as EditarPublicacionFormProps).defaultValues?.tipo_publicacion ?? "material")
    : (tipoPublicacionProp ?? "material");
  const showTipoSelector = !isEditing && !tipoPublicacionProp;
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

  const selectedCategorias: number[] = watch("categorias") ?? [];
  const watchedTipo = (watch("tipo_publicacion") as TipoPublicacion | undefined) ?? tipoPublicacionSeleccionada;

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

          <TipoPublicacionField
            value={watchedTipo}
            editable={showTipoSelector}
            onChange={(tipo) => setValue("tipo_publicacion", tipo, { shouldValidate: true })}
          />

          <CategoriasSelector
            etiquetas={etiquetasBD}
            selected={selectedCategorias}
            onToggle={toggleCategoria}
            error={errors.categorias?.message}
          />

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

          <ImagenesUploader
            imagenesExistentes={imagenesExistentes}
            imagePreviews={imagePreviews}
            addImages={addImages}
            removeImage={removeImage}
            removeExistingImage={removeExistingImage}
          />

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
