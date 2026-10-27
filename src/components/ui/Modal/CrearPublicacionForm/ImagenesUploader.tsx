"use client";

import { useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useToast } from "../../../../hooks/useToast";
import ImageCropper from "../ActualizarPerfil/SubirImagen/ImageCropper";

interface ImagenesUploaderProps {
  imagenesExistentes: string[];
  imagePreviews: string[];
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  removeExistingImage?: (url: string) => void;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No fue posible leer la imagen"));
    reader.readAsDataURL(file);
  });

// Zona de carga de imágenes con recorte secuencial y previsualizaciones.
export default function ImagenesUploader({
  imagenesExistentes,
  imagePreviews,
  addImages,
  removeImage,
  removeExistingImage,
}: ImagenesUploaderProps) {
  const t = useTranslations("publicacionForm");
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [pendingCropFiles, setPendingCropFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const beginCropFlow = async (files: FileList | File[]) => {
    try {
      const filesArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (filesArray.length === 0) return;

      const [firstFile, ...restFiles] = filesArray;
      setPendingCropFiles(restFiles);
      const src = await fileToDataUrl(firstFile);
      setImageToCrop(src);
    } catch {
      toast.error(t("imageLoadError"));
      setImageToCrop(null);
      setPendingCropFiles([]);
    }
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
    setPendingCropFiles([]);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      addImages([croppedFile]);

      if (pendingCropFiles.length === 0) {
        setImageToCrop(null);
        return;
      }

      const [nextFile, ...restFiles] = pendingCropFiles;
      setPendingCropFiles(restFiles);
      const src = await fileToDataUrl(nextFile);
      setImageToCrop(src);
    } catch {
      toast.error(t("imageLoadError"));
      setImageToCrop(null);
      setPendingCropFiles([]);
    }
  };

  return (
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
          void beginCropFlow(e.dataTransfer.files);
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
          onChange={(e) => {
            if (!e.target.files) return;
            void beginCropFlow(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {(imagenesExistentes.length > 0 || imagePreviews.length > 0) && (
        <div className="crear-publicacion__previews">
          {imagenesExistentes.map((url, index) => (
            <div key={url} className="crear-publicacion__preview-item">
              <Image src={url} alt={t("fields.existingImageAlt", { n: index + 1 })} width={160} height={160} unoptimized className="crear-publicacion__preview-img" />
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
              <Image src={src} alt={t("fields.newImageAlt", { n: i + 1 })} width={160} height={160} unoptimized className="crear-publicacion__preview-img" />
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

      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={(file) => {
            void handleCropComplete(file);
          }}
          onCancel={handleCropCancel}
          cropShape="rect"
          aspect={1}
        />
      )}
    </div>
  );
}
