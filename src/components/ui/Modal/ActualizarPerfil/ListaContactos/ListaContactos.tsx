"use client";
import { useTranslations } from "next-intl";
import {X, Plus} from "lucide-react";
import type { Contact } from "../../../../../types/comment";
import "./ListaContactos.css";

interface UserContactProps {
    contacts: Contact[];
}

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
          <select
            className="lista-contactos__select"
            value={contact.type}
            onChange={(e) => onChange(contact.id, "type", e.target.value)}
          >
            <option value="">{t("typePlaceholder")}</option>
            <option value="telefono">{t("types.phone")}</option>
            <option value="whatsapp">{t("types.whatsapp")}</option>
            <option value="instagram">{t("types.instagram")}</option>
            <option value="correo_personal">{t("types.email")}</option>
          </select>
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