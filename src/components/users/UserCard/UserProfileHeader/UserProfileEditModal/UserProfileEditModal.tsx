"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { UserProfileEditData } from "../../../../../types/perfil";
import "../../../../ui/Button/Button.css";
import "./UserProfileEditModal.css";

interface UserProfileEditModalProps {
  user: UserProfileEditData;
  showPaymentMethod?: boolean;
  onSave: (updated: Partial<UserProfileEditData>) => Promise<void> | void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserProfileEditModal({
  user,
  showPaymentMethod = false,
  onSave,
  onClose,
}: UserProfileEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    name:          user.name,
    description:   user.description,
    imageUrl:      user.imageUrl ?? "",
    paymentMethod: user.paymentMethod ?? "",
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        name:          draft.name.trim()          || user.name,
        description:   draft.description.trim()   || user.description,
        imageUrl:      draft.imageUrl.trim()       || undefined,
        ...(showPaymentMethod && {
          paymentMethod: draft.paymentMethod.trim() || undefined,
        }),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="edit-modal__overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="edit-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">Editar perfil</h2>
          <button
            type="button"
            className="edit-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="edit-modal__body">

          <div className="edit-modal__field">
            <label className="edit-modal__label">Nombre</label>
            <input
              type="text"
              className="edit-modal__input"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="edit-modal__field">
            <label className="edit-modal__label">Descripción</label>
            <textarea
              className="edit-modal__textarea"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Cuéntanos un poco sobre ti…"
              rows={3}
            />
          </div>

          <div className="edit-modal__field">
            <label className="edit-modal__label">URL de foto de perfil</label>
            <input
              type="url"
              className="edit-modal__input"
              value={draft.imageUrl}
              onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          {showPaymentMethod && (
            <div className="edit-modal__field">
              <label className="edit-modal__label">Método de pago</label>
              <input
                type="text"
                className="edit-modal__input"
                value={draft.paymentMethod}
                onChange={(e) => setDraft((d) => ({ ...d, paymentMethod: e.target.value }))}
                placeholder="Ej: Transferencia, Efectivo, Depósito…"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="edit-modal__footer">
          <button
            type="button"
            className="button button--medium button--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button button--medium"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}