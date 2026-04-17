"use client";

import { useState } from "react";
import { Pencil, CreditCard } from "lucide-react";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import UserRating from "../UserRating/UserRating";
import UserContact from "../UserContact/UserContact";
import UserProfileEditModal from "./UserProfileEditModal/UserProfileEditModal";
import type { UserProfileData, UserProfileEditData } from "../../../../types/perfil";
import "./UserProfileHeader.css";

interface UserProfileHeaderProps {
  user: UserProfileData;
  tagColors?: Record<string, string>;
  onSave?: (updated: Partial<UserProfileEditData>) => Promise<void> | void;
}

// ── Default tag colour map ────────────────────────────────────────────────────

const DEFAULT_TAG_COLORS: Record<string, string> = {
  assembler:    "#7c3aed",
  comunicacion: "#db2777",
  electronica:  "#0d9488",
  fisica:       "#ca8a04",
  diseno:       "#ea580c",
  biologia:     "#16a34a",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserProfileHeader({
  user,
  tagColors = DEFAULT_TAG_COLORS,
  onSave,
}: UserProfileHeaderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const showPaymentMethod = Boolean(user.paymentMethod);

  return (
    <>
      {/* ── 3-column profile header ──────────────────────────────── */}
      <div className="user-profile-header">

        {/* Col 1 — Avatar + rating */}
        <div className="user-profile-header__avatar-col">
          <ProfilePicture
            imageUrl={user.imageUrl}
            userName={user.name}
            size="lg"
          />
          <UserRating score={user.rating} totalReviews={user.totalReviews} />
        </div>

        {/* Col 2 — Name, description, payment */}
        <div className="user-profile-header__info-col">
          <div className="user-profile-header__name-row">
            <h1 className="user-profile-header__name">{user.name}</h1>
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
        </div>

        {/* Col 3 — Tags + contact */}
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

      {/* ── Edit modal ─────────────────────────────────────────────── */}
      {modalOpen && onSave && (
        <UserProfileEditModal
          user={{
            name:          user.name,
            description:   user.description,
            imageUrl:      user.imageUrl,
            paymentMethod: user.paymentMethod,
          }}
          showPaymentMethod={showPaymentMethod}
          onSave={onSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}