"use client";

import { useState, useMemo } from "react";
import { Pencil, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import UserRating from "../UserRating/UserRating";
import UserContact from "../UserContact/UserContact";
import ActualizarPerfilModal from "../../../ui/Modal/ActualizarPerfil/ActualizarPerfilModal";
import TagBadge from "../../../ui/TagBadge/TagBadge";
import { apiClient } from "../../../../lib/apiClient";
import { imagenService } from "../../../../services/imagenService";
import type { UserProfileData, UserProfileEditData } from "../../../../types/perfil";
import type { Tag } from "../../../../types/tag";
import { useToast } from "../../../../hooks/useToast";
import { usePerspectivaInterna } from "../../../../context/PerspectivaInternaContext";
import {
  contactosToUpsertBody,
  reemplazarContactosUsuario,
} from "../../../../lib/contactosUsuario";

import "./UserProfileHeader.css";

interface UserProfileHeaderProps {
  user: UserProfileData;
  onSave?: (updated: Partial<UserProfileEditData>) => Promise<void> | void;
}

export default function UserProfileHeader({
  user,
  onSave,
}: UserProfileHeaderProps) {
  const t = useTranslations('profileHeader');

  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(user.imageUrl);
  const toast = useToast();
  const { canEditProfile } = usePerspectivaInterna();
  const [nombre, ...resto] = user.name.split(" ");
  const apellido = resto.join(" ");
  

  const initialModalContacts = useMemo(
    () =>
      user.contacts.map((c, i) => ({
        id: i + 1,
        type: c.platform,
        value: c.url,
      })),
    [user.contacts]
  );

  const handleSave = async (data: Parameters<typeof ActualizarPerfilModal>[0]["onSubmit"] extends (d: infer D) => any ? D : never) => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const nombreCompleto = `${data.nombre} ${data.apellido}`.trim();
      const contactosValidos = data.contacts
        .filter((c) => c.type !== "" && c.value.trim() !== "")
        .map((c) => ({
          tipo_contacto: c.type,
          valor: c.value.trim(),
        }));

      let urlFoto: string | undefined;
      if (data.foto) {
        urlFoto = await imagenService.uploadFotoPerfil(user.id_usuario, data.foto);
        setDisplayImageUrl(`${urlFoto}?t=${Date.now()}`);
      }

      await apiClient.patch(`/api/user/${user.id_usuario}`, {
        nombre: nombreCompleto,
        descripcion: data.descripcion,
        ...(urlFoto ? { url_foto_perfil: urlFoto } : {}),
      });

      await reemplazarContactosUsuario(
        user.id_usuario,
        contactosToUpsertBody(data.contacts)
      );

      onSave?.({
        name: nombreCompleto,
        description: data.descripcion,
        contacts: contactosValidos,
        ...(urlFoto ? { imageUrl: urlFoto } : {}),
      });

      setModalOpen(false);
      toast.success(t('toast.updateSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('toast.updateErrorFallback'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="user-profile-header">

        <div className="user-profile-header__avatar-col">
          <ProfilePicture imageUrl={displayImageUrl} userName={user.name} size="lg" />
          <UserRating score={user.calificacion ?? 0} totalReviews={user.totalReviews} />
        </div>

        <div className="user-profile-header__info-col">
          <div className="user-profile-header__name-row">
            <h1 className="user-profile-header__name">{nombre} {apellido}</h1>
            {canEditProfile && (
              <button
                type="button"
                className="user-profile-header__edit-btn"
                onClick={() => setModalOpen(true)}
                aria-label={t('aria.editProfile')}
              >
                <Pencil size={12} />
                {t('actions.editProfile')}
              </button>
            )}
          </div>

          <p className="user-profile-header__description">{user.description}</p>

          {user.paymentMethod && (
            <div className="user-profile-header__payment">
              <CreditCard size={16} className="user-profile-header__payment-icon" />
              <span>
                <strong>{t('labels.paymentMethod')}</strong> {user.paymentMethod}
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
                <TagBadge key={tag.id} tag={tag} size="lg" />
              ))}
            </div>
          )}
          <div className="user-profile-header__contact-block">
            <p className="user-profile-header__contact-label">{t('labels.contact')}</p>
            <UserContact contacts={user.contacts} />
          </div>
        </div>

      </div>

      {canEditProfile && modalOpen && (
        <ActualizarPerfilModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialNombre={nombre}
          initialApellido={apellido}
          initialDescripcion={user.description}
          initialContacts={initialModalContacts}
          initialFoto={displayImageUrl ?? null}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
