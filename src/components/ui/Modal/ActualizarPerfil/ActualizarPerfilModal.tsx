"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import PerfilForm from "./PerfilForm/PerfilForm";
import ListaContactos, { type Contacto } from "./ListaContactos/ListaContactos";
import "../../Button/Button.css";
import "./ActualizarPerfilModal.css";
import "../Modal.css";
import SubirImagen from "./SubirImagen/SubirImagen";
import { useUIStore } from "../../../../store/uiStore";

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

const genContactId = (): number => Date.now() + Math.floor(Math.random() * 1000000);

const getEmptyContacts = (): Contacto[] => [
  { id: genContactId(), type: "", value: "" },
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
  const t = useTranslations("updateProfileModal");
  const { mostrarConfirm } = useUIStore();

  const [nombre, setNombre] = useState(initialNombre);
  const [apellido, setApellido] = useState(initialApellido);
  const [descripcion, setDescripcion] = useState(initialDescripcion);
  const [contacts, setContacts] = useState<Contacto[]>(() => {
    if (initialContacts && initialContacts.length > 0) {
      const seen = new Set<number>();
      return initialContacts.map((c) => {
        if (!c?.id || seen.has(c.id)) {
          const id = genContactId();
          seen.add(id);
          return { ...c, id };
        }
        seen.add(c.id);
        return c;
      });
    }
    return getEmptyContacts();
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const normalizeContacts = (items: Contacto[]) =>
    items
      .map((c) => ({ type: c.type.trim(), value: c.value.trim() }))
      .filter((c) => c.type !== "" || c.value !== "");

  const hasUnsavedChanges = useMemo(() => {
    const sameNombre = nombre.trim() === initialNombre.trim();
    const sameApellido = apellido.trim() === initialApellido.trim();
    const sameDescripcion = descripcion.trim() === initialDescripcion.trim();
    const sameContacts =
      JSON.stringify(normalizeContacts(contacts)) ===
      JSON.stringify(normalizeContacts(initialContacts));
    const changedPhoto = foto !== null;

    return !(sameNombre && sameApellido && sameDescripcion && sameContacts && !changedPhoto);
  }, [nombre, apellido, descripcion, contacts, foto, initialNombre, initialApellido, initialDescripcion, initialContacts]);

  //Resetea el forms cada vez que abre,con los datos iniciales
  useEffect(() => {
    if (isOpen) {
      setNombre(initialNombre);
      setApellido(initialApellido);
      setDescripcion(initialDescripcion);
      if (initialContacts && initialContacts.length > 0) {
        const seen = new Set<number>();
        setContacts(
          initialContacts.map((c) => {
            if (!c?.id || seen.has(c.id)) {
              const id = genContactId();
              seen.add(id);
              return { ...c, id };
            }
            seen.add(c.id);
            return c;
          })
        );
      } else {
        setContacts(getEmptyContacts());
      }
      setFoto(null);
      setPreviewUrl(null);
    }
  }, [isOpen, initialNombre, initialApellido, initialDescripcion, initialContacts]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { id: genContactId(), type: "", value: "" }]);
  };

  const removeContact = (id: number) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateContact = (id: number, field: "type" | "value", value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const runSubmit = async () => {
    await onSubmit({ nombre, apellido, descripcion, contacts, foto: foto ?? undefined });
  };

  const handleSubmit = () => {
    if (isSaving) return;
    mostrarConfirm({
      titulo: t("confirm.submit.title"),
      mensaje: t("confirm.submit.message"),
      onConfirm: runSubmit,
    });
  };

//Se resetea el forms cuando se cancela
  const closeModal = () => {
    onCancel();
    onClose?.();
  };

  const handleCancel = () => {
    if (isSaving) return;

    if (hasUnsavedChanges) {
      mostrarConfirm({
        titulo: t("confirm.discard.title"),
        mensaje: t("confirm.discard.message"),
        onConfirm: closeModal,
      });
      return;
    }

    closeModal();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleCancel}>
        <div className="update-profile-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="update-profile-modal__title">{t("title")}</h2>

          <div className="update-profile-modal__body">
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
              <label className="update-profile-modal__label">{t("photoLabel")}</label>
              <SubirImagen
                onFileChange={handleFileChange}
                previewUrl={previewUrl}
                currentProfileImage={initialFoto}
              />
            </div>
          </div>

          <div className="update-profile-modal__footer">
            <button
              type="button"
              className="update-profile-modal__btn-cancel"
              onClick={handleCancel}
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              className="button button--medium"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? t("actions.saving") : t("actions.update")} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

    </>
  );
}