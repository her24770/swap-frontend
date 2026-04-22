"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import PerfilForm from "./PerfilForm/PerfilForm";
import ListaContactos, { type Contacto } from "./ListaContactos/ListaContactos";
import "../../Button/Button.css";
import "./ActualizarPerfilModal.css";
import "../Modal.css";
import SubirImagen from "./SubirImagen/SubirImagen";

interface ActualizarPerfilModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialNombre?: string;
  initialApellido?: string;
  initialDescripcion?: string;
  initialContacts?: Contacto[];
  initialFoto?: string|null;
  onSubmit: (data: {
    nombre: string;
    apellido: string;
    descripcion: string;
    contacts: Contacto[];
    foto?: File;
  }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

let contactIdCounter = 1;

const getEmptyContacts = (): Contacto[] => [
  { id: contactIdCounter++, type: "", value: "" },
];

export default function ActualizarPerfilModal({
  isOpen = true,
  onClose,
  initialNombre = "",
  initialApellido = "",
  initialDescripcion = "",
  initialContacts = [],
  initialFoto = null,
  onSubmit,
  onCancel,
  isSaving = false,
}: ActualizarPerfilModalProps) {
  const [nombre, setNombre] = useState(initialNombre);
  const [apellido, setApellido] = useState(initialApellido);
  const [descripcion, setDescripcion] = useState(initialDescripcion);
  const [contacts, setContacts] = useState<Contacto[]>(
    initialContacts && initialContacts.length > 0
      ? initialContacts
      : getEmptyContacts()
    );
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  //Resetea el forms cada vez que abre,con los datos iniciales
  useEffect(() => {
    if (isOpen) {
      setNombre(initialNombre);
      setApellido(initialApellido);
      setDescripcion(initialDescripcion);
      setContacts(
        initialContacts && initialContacts.length > 0
          ? initialContacts
          : getEmptyContacts()
      );
      setFoto(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setFoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { id: contactIdCounter++, type: "", value: "" }]);
  };

  const removeContact = (id: number) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateContact = (id: number, field: "type" | "value", value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async () => {
    await onSubmit({ nombre, apellido, descripcion, contacts, foto: foto ?? undefined });
  };

//Se resetea el forms cuando se cancela
  const handleCancel = () => {
    onCancel();
    onClose?.();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="update-profile-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="update-profile-modal__title">Actualizar perfil</h2>

        <PerfilForm
          nombre={nombre}
          apellido={apellido}
          descripcion={descripcion}
          onNombreChange={setNombre}
          onApellidoChange={setApellido}
          onDescripcionChange={setDescripcion}
        />

        <ListaContactos
          contacts={contacts}
          onAdd={addContact}
          onRemove={removeContact}
          onChange={updateContact}
        />

        <div className="update-profile-modal__foto">
          <label className="update-profile-modal__label">Foto de Perfil</label>
          <SubirImagen
            onFileChange={handleFileChange}
            previewUrl={previewUrl}
          />
        </div>

        <div className="update-profile-modal__footer">
          <button
            type="button"
            className="update-profile-modal__btn-cancel"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button button--medium"
            onClick={handleSubmit}
            disabled = {isSaving}
          >
            {isSaving ? "Guardando..." : "Actualizar"} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}