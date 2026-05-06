import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../../../utils/cropImage";
import "./ImageCropper.css";
import "../../../Button/Button.css";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-container">
        <div className="image-cropper-body">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
          />
        </div>
        <div className="image-cropper-controls">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            className="zoom-range"
          />
        </div>
        <div className="image-cropper-footer">
          <button className="button button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button button--medium" onClick={showCroppedImage}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
