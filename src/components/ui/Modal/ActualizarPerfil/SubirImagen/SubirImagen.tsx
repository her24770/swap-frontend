"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, UserCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ImageCropper from "./ImageCropper";
import "./SubirImagen.css";

interface SubirImagenProps {
  onFileChange: (file: File) => void;
  previewUrl: string | null;
  currentProfileImage?: string | null;
}

export default function SubirImagen({ onFileChange, previewUrl, currentProfileImage }: SubirImagenProps) {
  const t = useTranslations("updateProfileModal.imageUpload");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      // We reset the input so the user can select the same file again if they cancel
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    setImageToCrop(null);
    onFileChange(croppedFile);
  };

  return (
    <div className="profile-image-upload">
      <div
        className={`profile-image-upload__dropzone${isDragging ? " profile-image-upload__dropzone--active" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        {/*Drop zone para subir la imagen de perfil */}
        <CloudUpload size={32} className="profile-image-upload__icon" />
        <p className="profile-image-upload__text">
          {t("text")}
        </p>
        <span className="profile-image-upload__hint">
          {t("hint")}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
     {/* Preview de la imagen para el perfil */}
      <div className="profile-image-upload__preview">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={t("previewAlt")}
            className="profile-image-upload__img"
          />
        ) : currentProfileImage ? (
          <div style={{ position: 'relative', width: '7rem', height: '7rem', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--swap-primary-border-color)' }}>
            <Image
              src={currentProfileImage}
              alt={t("currentImageAlt")}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </div>
        ) : (
          <UserCircle2
            size={96}
            strokeWidth={1}
            className="profile-image-upload__placeholder"
          />
        )}
      </div>

      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
}