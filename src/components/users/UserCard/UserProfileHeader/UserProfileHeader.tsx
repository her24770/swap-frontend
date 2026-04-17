"use client";

import { useState } from "react";
import { Pencil, CreditCard } from "lucide-react";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import UserRating from "../UserRating/UserRating";
import UserContact from "../UserContact/UserContact";
import ActualizarPerfilModal from "../../../ui/Modal/ActualizarPerfil/ActualizarPerfilModal";
import { apiClient } from "../../../../lib/apiClient";
import type { UserProfileData, UserProfileEditData } from "../../../../types/perfil";
import "./UserProfileHeader.css";

interface UserProfileHeaderProps {
  user: UserProfileData;
  tagColors?: Record<string, string>;
  onSave?: (updated: Partial<UserProfileEditData>) => Promise<void> | void;
}

const DEFAULT_TAG_COLORS: Record<string, string> = {
  assembler:    "#7c3aed",
  comunicacion: "#db2777",
  electronica:  "#0d9488",
  fisica:       "#ca8a04",
  diseno:       "#ea580c",
  biologia:     "#16a34a",
};

export default function UserProfileHeader({
  user,
  tagColors = DEFAULT_TAG_COLORS,
  onSave,
}: UserProfileHeaderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [nombre, ...resto] = user.name.split(" ");
  const apellido = resto.join(" ");

  const handleSave = async (data: Parameters<typeof ActualizarPerfilModal>[0]["onSubmit"] extends (d: infer D) => any ? D : never) => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const nombreCompleto = `${data.nombre} ${data.apellido}`.trim();
      const contactosValidos = data.contacts
        .filter((c) => c.type !== "")
        .map((c) => ({
          tipo_contacto: c.type,
          valor: c.value,
        }));

      await apiClient.patch(`/api/user/${user.id_usuario}`, {
        nombre: nombreCompleto,
        descripcion: data.descripcion,
        contacts: contactosValidos,
        ...(data.foto ? {} : {}),
      });

      onSave?.({
        name: nombreCompleto,
        description: data.descripcion,
        contacts: contactosValidos,
      });

      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err.message || "No fue posible actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="user-profile-header">

        <div className="user-profile-header__avatar-col">
          <ProfilePicture imageUrl={user.imageUrl} userName={user.name} size="lg" />
          <UserRating score={user.rating} totalReviews={user.totalReviews} />
        </div>

        <div className="user-profile-header__info-col">
          <div className="user-profile-header__name-row">
            <h1 className="user-profile-header__name">{nombre} {apellido}</h1>
            <button
              type="button"
              className="user-profile-header__edit-btn"
              onClick={() => setModalOpen(true)}
              aria-label="Editar perfil"
            >
              <Pencil size={12} />
              Editar perfil
            </button>
          </div>

          <p className="user-profile-header__description">{user.description}</p>

          {user.paymentMethod && (
            <div className="user-profile-header__payment">
              <CreditCard size={16} className="user-profile-header__payment-icon" />
              <span>
                <strong>Metodo de pago:</strong> {user.paymentMethod}
              </span>
            </div>
          )}

          {/* Error de guardado inline */}
          {saveError && (
            <p className="user-profile-header__save-error">{saveError}</p>
          )}
        </div>

        <div className="user-profile-header__side-col">
          {user.tags && user.tags.length > 0 && (
            <div className="user-profile-header__tags">
              {user.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="user-profile-header__tag"
                  style={{ backgroundColor: tagColors[tag.colorKey] ?? "#64748b" }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="user-profile-header__contact-block">
            <p className="user-profile-header__contact-label">Contacto</p>
            <UserContact contacts={user.contacts} />
          </div>
        </div>

      </div>

      {modalOpen && (
        <ActualizarPerfilModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialNombre={nombre}
          initialApellido={apellido}
          initialDescripcion={user.description}
          initialContacts={user.contacts.map((c, i) => ({
            id: i + 1,
            type: c.platform,
            value: c.url,
          }))}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          isSaving={isSaving}
        />
      )}
    </>
  );
}