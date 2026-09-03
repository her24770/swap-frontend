"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, Check, ChevronDown } from "lucide-react";
import "./ListaContactos.css";

export interface Contacto {
  id: number;
  type: string;
  value: string;
}

interface ListaContactosProps {
  contacts: Contacto[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChange: (id: number, field: "type" | "value", value: string) => void;
}

interface TipoContactoSelectProps {
  value: string;
  onSelect: (value: string) => void;
}

function TipoContactoSelect({ value, onSelect }: TipoContactoSelectProps) {
  const t = useTranslations("updateProfileModal.contacts");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (next: string) => {
    setOpen(false);
    if (next !== value) onSelect(next);
  };

  const labelFor = (type: string) => {
    switch (type) {
      case "telefono":
        return t("types.phone");
      case "whatsapp":
        return t("types.whatsapp");
      case "instagram":
        return t("types.instagram");
      case "correo_personal":
        return t("types.email");
      default:
        return t("typePlaceholder");
    }
  };

  const renderOption = (type: string) => {
    const selected = type === value;
    return (
      <li key={type} role="option" aria-selected={selected}>
        <button
          type="button"
          className={`lista-contactos__select-option${
            selected ? " lista-contactos__select-option--selected" : ""
          }`}
          onClick={() => handleSelect(type)}
        >
          <span>{labelFor(type)}</span>
          {selected && <Check size={14} className="lista-contactos__select-check" />}
        </button>
      </li>
    );
  };

  return (
    <div className="lista-contactos__select" ref={wrapperRef}>
      <button
        type="button"
        className={`lista-contactos__select-trigger${open ? " lista-contactos__select-trigger--open" : ""}${
          value ? "" : " lista-contactos__select-trigger--placeholder"
        }`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lista-contactos__select-value">{labelFor(value)}</span>
        <ChevronDown
          size={15}
          className={`lista-contactos__select-chevron${open ? " lista-contactos__select-chevron--open" : ""}`}
        />
      </button>

      {open && (
        <ul className="lista-contactos__select-menu" role="listbox">
          {renderOption("telefono")}
          {renderOption("whatsapp")}
          {renderOption("instagram")}
          {renderOption("correo_personal")}
        </ul>
      )}
    </div>
  );
}

export default function ListaContactos({ contacts, onAdd, onRemove, onChange }: ListaContactosProps) {
  const t = useTranslations("updateProfileModal.contacts");

  return (
    <div className="lista-contactos">
      <div className="lista-contactos__header">
        <label className="lista-contactos__label">{t("label")}</label>
      {/*Boton para agregar mas contactos, de los tipos predeterminados */}
        <button
          type="button"
          className="lista-contactos__btn-add"
          onClick={onAdd}
          aria-label={t("addAria")}
        >
            <Plus size={16} />
        </button>
      </div>

      {contacts.map((contact) => (
        <div key={contact.id} className="lista-contactos__row">
          <TipoContactoSelect
            value={contact.type}
            onSelect={(next) => onChange(contact.id, "type", next)}
          />
          <input
            type="text"
            className="lista-contactos__input"
            placeholder={t("valuePlaceholder")}
            value={contact.value}
            onChange={(e) => onChange(contact.id, "value", e.target.value)}
          />
          <button
            type="button"
            className="lista-contactos__btn-remove"
            onClick={() => onRemove(contact.id)}
            aria-label={t("removeAria")}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
