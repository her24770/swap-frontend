import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaAnuncio, AnuncioInput } from "../../../../schemas/schemaAnuncios";
import { anuncioService } from "../../../../services/anuncioService";


interface CrearAnuncioFormProps {
    onAnuncioCreado?: () => void;
    onCancelar?: () => void;
}

export function CrearAnuncioForm({ onAnuncioCreado, onCancelar }: CrearAnuncioFormProps) {
    const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
    const [vistaPreviaUrl, setVistaPreviaUrl] = useState<string | null>(null);
    const [errorImagen, setErrorImagen] = useState<string | null>(null);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [cargando, setCargando] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnuncioInput>({
        resolver: zodResolver(schemaAnuncio),
        defaultValues: {
        titulo: "",
        descripcion: "",
        },
    });

    const procesarArchivo = (file: File) => {
        if (!file.type.startsWith("image/")) {
        setErrorImagen("El archivo debe ser una imagen válida (PNG, JPG, WEBP).");
        return;
        }
        if (file.size > 5 * 1024 * 1024) {
        setErrorImagen("La imagen no debe pesar más de 5MB.");
        return;
        }

        setErrorImagen(null);
        setArchivoImagen(file);
        
        const objectUrl = URL.createObjectURL(file);
        setVistaPreviaUrl(objectUrl);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        procesarArchivo(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        procesarArchivo(e.dataTransfer.files[0]);
        }
    };

    const removerImagen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setArchivoImagen(null);
        if (vistaPreviaUrl) {
        URL.revokeObjectURL(vistaPreviaUrl);
        setVistaPreviaUrl(null);
        }
    };

    const onSubmit = async (data: AnuncioInput) => {
        if (!archivoImagen) {
        setErrorImagen("La imagen del anuncio es obligatoria para publicar.");
        return;
        }

        try {
        setCargando(true);
        setErrorServidor(null);

        const formData = new FormData();
        formData.append("titulo", data.titulo);
        formData.append("descripcion", data.descripcion);
        formData.append("imagen", archivoImagen); 

        await anuncioService.crearAnuncio(formData);

        reset();
        setArchivoImagen(null);
        setVistaPreviaUrl(null);
        
        if (onAnuncioCreado) onAnuncioCreado();
        } catch (error: any) {
        setErrorServidor(error.message || "Hubo un problema al conectar con el servidor.");
        } finally {
        setCargando(false);
        }
    };

    return (
        <div className="crear-publicacion">
        <header className="crear-publicacion__header">
            <div className="crear-publicacion__header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            </div>
            <h2 className="crear-publicacion__title">Crear nuevo anuncio</h2>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="crear-publicacion__fields">
            {/* Campo Título */}
            <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Título del anuncio</label>
            <input
                type="text"
                placeholder="¿Qué artículo deseas anunciar?"
                {...register("titulo")}
                className={`crear-publicacion__input ${errors.titulo ? "crear-publicacion__input--error" : ""}`}
            />
            {errors.titulo && <span className="crear-publicacion__error">{errors.titulo.message}</span>}
            </div>

            {/* Campo Descripción */}
            <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Descripción</label>
            <textarea
                placeholder="Detalla el estado de tu artículo, qué buscas a cambio, disponibilidad, etc..."
                {...register("descripcion")}
                className={`crear-publicacion__textarea ${errors.descripcion ? "crear-publicacion__textarea--error" : ""}`}
            />
            {errors.descripcion && <span className="crear-publicacion__error">{errors.descripcion.message}</span>}
            </div>

            {/* Zona de Carga de Imagen */}
            <div className="crear-publicacion__field">
            <label className="crear-publicacion__label">Foto del artículo</label>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="crear-publicacion__upload-input"
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`crear-publicacion__upload-zone ${
                isDragOver ? "crear-publicacion__upload-zone--dragover" : ""
                }`}
            >
                <div className="crear-publicacion__upload-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                </div>
                <p className="crear-publicacion__upload-text">
                Arrastra una imagen o haz clic para buscar
                </p>
                <p className="crear-publicacion__upload-hint">
                Formatos aceptados: PNG, JPG o WEBP (Máx. 5MB)
                </p>
            </div>

            {errorImagen && <span className="crear-publicacion__error">{errorImagen}</span>}

            {/* Previews */}
            {vistaPreviaUrl && (
                <div className="crear-publicacion__previews">
                <div className="crear-publicacion__preview-item">
                    <img
                    src={vistaPreviaUrl}
                    alt="Vista previa del artículo"
                    className="crear-publicacion__preview-img"
                    />
                    <button
                    type="button"
                    onClick={removerImagen}
                    className="crear-publicacion__preview-remove"
                    title="Eliminar imagen"
                    >
                    ✕
                    </button>
                </div>
                </div>
            )}
            </div>

            {/* Mensaje de error controlado desde tu servicio */}
            {errorServidor && (
            <p className="crear-publicacion__server-error">
                {errorServidor}
            </p>
            )}

            {/* Footer */}
            <footer className="crear-publicacion__footer">
            <button
                type="button"
                onClick={onCancelar}
                disabled={cargando}
                className="crear-publicacion__btn-cancel"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={cargando}
                className="crear-publicacion__btn-submit"
            >
                {cargando ? "Publicando..." : "Publicar Anuncio"}
            </button>
            </footer>
        </form>
        </div>
    );
}