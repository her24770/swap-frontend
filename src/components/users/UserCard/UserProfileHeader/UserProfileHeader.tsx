"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Pencil, CreditCard, FileText, Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import UserRating from "../UserRating/UserRating";
import UserContact from "../UserContact/UserContact";
import ActualizarPerfilModal from "../../../ui/Modal/ActualizarPerfil/ActualizarPerfilModal";
import UserTagsModal from "../UserTagsModal/UserTagsModal";
import TagBadge from "../../../ui/TagBadge/TagBadge";
import { apiClient } from "../../../../lib/apiClient";
import { imagenService } from "../../../../services/imagenService";
import type { UserProfileData, UserProfileEditData } from "../../../../types/perfil";
import type { Tag } from "../../../../types/tag";
import type { Certificacion } from "../../../../types/certificacion";
import { useToast } from "../../../../hooks/useToast";
import { usePerspectivaInterna } from "../../../../context/PerspectivaInternaContext";
import { useUIStore } from "../../../../store/uiStore";
import { contactosToUpsertBody, reemplazarContactosUsuario } from "../../../../lib/contactosUsuario";
import "./UserProfileHeader.css";
import Certificaciones from "../../../users/Certificaciones/Certificaciones";

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
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(user.imageUrl);
  const [displayTags, setDisplayTags] = useState<Tag[]>(user.tags ?? []);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [showCerts, setShowCerts] = useState(false);
  const toast = useToast();
  const { canEditProfile } = usePerspectivaInterna();
  const { mostrarConfirm } = useUIStore();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [nombre, ...resto] = user.name.split(" ");
  const apellido = resto.join(" ");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato no válido. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 5 MB.");
      return;
    }

    mostrarConfirm({
      titulo: "Cambiar foto de perfil",
      mensaje: "¿Deseas actualizar tu foto de perfil?",
      onConfirm: async () => {
        try {
          setIsUploadingFoto(true);
          const urlFoto = await imagenService.uploadFotoPerfil(user.id_usuario, file);
          await apiClient.patch(`/api/user/${user.id_usuario}`, { url_foto_perfil: urlFoto });
          setDisplayImageUrl(`${urlFoto}?t=${Date.now()}`);
          toast.success("Foto de perfil actualizada exitosamente.");
        } catch (err: any) {
          toast.error(err.message || "No fue posible actualizar la foto de perfil.");
        } finally {
          setIsUploadingFoto(false);
        }
      },
    });
  };

  const fetchCertificaciones = useCallback(async () => {
    if (!user.id_usuario) return;
    try {
      const res = await apiClient.get<{ data: Certificacion[] }>(`/api/certificacion/user/${user.id_usuario}`);
      setCertificaciones(res.data ?? []);
    } catch {
      setCertificaciones([]);
    }
  }, [user.id_usuario]);

  useEffect(() => {
    fetchCertificaciones();
  }, [fetchCertificaciones]);

  useEffect(() => {
    setDisplayTags(user.tags ?? []);
  }, [user.tags]);


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

  const handleTagsSaved = (tags: Tag[]) => {
    setDisplayTags(tags);
  };

  return (
    <>
      <div className="user-profile-header">

        <div className="user-profile-header__avatar-col">
          <div className="user-profile-header__avatar-wrapper">
            <ProfilePicture imageUrl={displayImageUrl} userName={user.name} size="lg" />
            {canEditProfile && (
              <>
                <div
                  className="user-profile-header__photo-overlay"
                  onClick={() => !isUploadingFoto && photoInputRef.current?.click()}
                  role="button"
                  aria-label="Cambiar foto de perfil"
                >
                  {isUploadingFoto
                    ? <Loader2 size={28} className="user-profile-header__upload-spinner" />
                    : <Camera size={28} />
                  }
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handlePhotoUpload}
                />
              </>
            )}
          </div>
          <UserRating score={user.calificacion ?? 0} totalReviews={user.totalResenas ?? 0} />
            <button
              type="button"
              className="certificacion-btn"
              onClick={() => setShowCerts((v) => !v)}
            >
              <FileText size={18} strokeWidth={1.8} aria-hidden />
              {showCerts ? "Ocultar certificaciones" : "Ver certificaciones"}
            </button>
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

            {/* {Botón para administrar las etiquetas del usuario} */}
            {canEditProfile && (
              <button
                type="button"
                className="etiquetas-btn"
                onClick={() => setTagsModalOpen(true)}
              >
                <Pencil size={12} strokeWidth={1.8} aria-hidden />
                {t('actions.editTags')}
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
          {displayTags.length > 0 && (
            <div className="user-profile-header__tags">
              {displayTags.map((tag) => (
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
      {showCerts && (
        <div className="user-profile-header__certs-panel">
          <hr className="perfil-page__divider" />
          <section className="perfil-page__section">
            <Certificaciones
              certificaciones={certificaciones}
              canEdit={canEditProfile}
              onRefresh={fetchCertificaciones}
            />
          </section>
        </div>
      )}

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

      {canEditProfile && tagsModalOpen && (
        <UserTagsModal
          isOpen={tagsModalOpen}
          userId={user.id_usuario}
          currentTags={displayTags}
          onClose={() => setTagsModalOpen(false)}
          onSaved={handleTagsSaved}
        />
      )}
    </>
  );
}
