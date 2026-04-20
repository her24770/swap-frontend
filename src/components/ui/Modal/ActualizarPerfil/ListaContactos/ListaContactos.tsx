"use client";
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
  return (
    <div className="lista-contactos">
      <div className="lista-contactos__header">
        <label className="lista-contactos__label">Contactos</label>
      {/*Boton para agregar mas contactos, de los tipos predeterminados */}
        <button
          type="button"
          className="lista-contactos__btn-add"
          onClick={onAdd}
          aria-label="Agregar contacto"
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
            <option value="">Seleccionar tipo</option>
            <option value="telefono">Teléfono</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="correo_personal">Correo</option>
          </select>
          <input
            type="text"
            className="lista-contactos__input"
            placeholder="contacto"
            value={contact.value}
            onChange={(e) => onChange(contact.id, "value", e.target.value)}
          />
          <button
            type="button"
            className="lista-contactos__btn-remove"
            onClick={() => onRemove(contact.id)}
            aria-label="Eliminar contacto"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}