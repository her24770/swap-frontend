"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SquarePlus, ChevronDown, Check, X, CloudUpload } from "lucide-react";
import "./CrearPublicacionForm.css";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(100, "El título no puede superar 100 caracteres."),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(500, "La descripción no puede superar 500 caracteres."),
  precio: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Ingresa un precio válido (ej. 25.00).")
    .or(z.literal("")),
  destacado: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  "Matemáticas",
  "Física",
  "Química",
  "Programación",
  "Diseño",
  "Idiomas",
  "Historia",
  "Economía",
  "Biología",
  "Arte",
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface CrearPublicacionFormProps {
  onSubmit?: (data: FormData & { categorias: string[]; imagenes: File[] }) => Promise<void>;
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CrearPublicacionForm({ onSubmit, onCancel }: CrearPublicacionFormProps) {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriasError, setCategoriasError] = useState<string | null>(null);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { titulo: "", descripcion: "", precio: "", destacado: false },
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  // ── Category handlers ──────────────────────────────────────────────────────

  const toggleCategoria = (cat: string) => {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCategoriasError(null);
  };

  const removeCategoria = (cat: string) => {
    setCategorias((prev) => prev.filter((c) => c !== cat));
  };

  // ── Image handlers ─────────────────────────────────────────────────────────

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(
      (f) => f.size <= 5 * 1024 * 1024 && ["image/png", "image/jpeg"].includes(f.type)
    );
    setImagenes((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleFormSubmit = async (data: FormData) => {
    if (categorias.length === 0) {
      setCategoriasError("Selecciona al menos una categoría.");
      return;
    }
    if (onSubmit) {
      await onSubmit({ ...data, categorias, imagenes });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const triggerLabel =
    categorias.length === 0
      ? "Seleccionar categoría"
      : `${categorias.length} categoría${categorias.length > 1 ? "s" : ""} seleccionada${categorias.length > 1 ? "s" : ""}`;

  return (
    <div className="crear-publicacion">
      {/* Header */}
      <div className="crear-publicacion__header">
        <div className="crear-publicacion__header-icon">
          <SquarePlus size={18} strokeWidth={1.8} />
        </div>
        <h2 className="crear-publicacion__title">Crear Publicación</h2>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div className="crear-publicacion__fields">

          {/* Título */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Nombre del Producto</label>
            <input
              type="text"
              placeholder="ej. Bolsa de tela de algodón sostenible"
              {...register("titulo")}
              className={`crear-publicacion__input${errors.titulo ? " crear-publicacion__input--error" : ""}`}
            />
            {errors.titulo && (
              <span className="crear-publicacion__error">{errors.titulo.message}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Descripción</label>
            <textarea
              placeholder="Describe las características y beneficios clave de tu producto..."
              {...register("descripcion")}
              className={`crear-publicacion__textarea${errors.descripcion ? " crear-publicacion__textarea--error" : ""}`}
            />
            {errors.descripcion && (
              <span className="crear-publicacion__error">{errors.descripcion.message}</span>
            )}
          </div>

          {/* Precio */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Precio</label>
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
            {errors.precio && (
              <span className="crear-publicacion__error">{errors.precio.message}</span>
            )}
          </div>

          {/* Categorías — multi-select dropdown */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Categoría</label>
            <div className="crear-publicacion__categories-dropdown" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={[
                  "crear-publicacion__categories-trigger",
                  categorias.length > 0 ? "crear-publicacion__categories-trigger--has-value" : "",
                  dropdownOpen ? "crear-publicacion__categories-trigger--open" : "",
                  categoriasError ? "crear-publicacion__categories-trigger--error" : "",
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
                  {CATEGORIAS.map((cat) => {
                    const selected = categorias.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategoria(cat)}
                        className={`crear-publicacion__categories-option${selected ? " crear-publicacion__categories-option--selected" : ""}`}
                      >
                        <span className={`crear-publicacion__categories-checkbox${selected ? " crear-publicacion__categories-checkbox--checked" : ""}`}>
                          {selected && <Check size={11} strokeWidth={3} color="white" />}
                        </span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected tags */}
            {categorias.length > 0 && (
              <div className="crear-publicacion__categories-tags">
                {categorias.map((cat) => (
                  <span key={cat} className="crear-publicacion__categories-tag">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategoria(cat)}
                      className="crear-publicacion__categories-tag-remove"
                      aria-label={`Eliminar ${cat}`}
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {categoriasError && (
              <span className="crear-publicacion__error">{categoriasError}</span>
            )}
          </div>

          {/* Destacado toggle */}
          <div className="crear-publicacion__field">
            <div className="crear-publicacion__toggle-row">
              <label className="crear-publicacion__toggle">
                <input
                  type="checkbox"
                  {...register("destacado")}
                  className="crear-publicacion__toggle-input"
                />
                <span className="crear-publicacion__toggle-track" />
              </label>
              <span className="crear-publicacion__toggle-label">Publicación Destacada</span>
            </div>
          </div>

          {/* Fotos */}
          <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Fotos del Producto</label>

            <div
              className={`crear-publicacion__upload-zone${dragOver ? " crear-publicacion__upload-zone--dragover" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <CloudUpload size={40} strokeWidth={1.5} className="crear-publicacion__upload-icon" />
              <p className="crear-publicacion__upload-text">
                Haz clic o arrastra imágenes para subir
              </p>
              <p className="crear-publicacion__upload-hint">
                Soporta PNG, JPG (máx. 5MB por archivo)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="crear-publicacion__upload-input"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div className="crear-publicacion__previews">
                {previews.map((src, i) => (
                  <div key={i} className="crear-publicacion__preview-item">
                    <img src={src} alt={`preview-${i}`} className="crear-publicacion__preview-img" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="crear-publicacion__preview-remove"
                      aria-label="Eliminar imagen"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="crear-publicacion__footer">
          <button
            type="button"
            onClick={onCancel}
            className="crear-publicacion__btn-cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="crear-publicacion__btn-submit"
          >
            {isSubmitting ? "Publicando..." : "Crear Publicación"}
          </button>
        </div>
      </form>
    </div>
  );
}