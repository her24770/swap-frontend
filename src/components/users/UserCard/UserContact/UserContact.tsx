"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Contact } from "../../../../types/comment";
import './UserContact.css';

interface UserContactProps {
  contacts: Contact[];
}

function isValidUrl(url: string) {
    try {
        // Si la URL no empieza con http o https, el constructor de URL podría fallar 
        // o dar resultados inesperados dependiendo del string.
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export default function UserContact({ contacts }: UserContactProps) {
    const t = useTranslations("common.aria");

    return (
        <div className="user-contact-group">
        {contacts.map((contact, index) => {
            const hasValidUrl = isValidUrl(contact.url);

            return (
            <div className="user-contact-wrapper" key={index}>
                {/* Si la URL es válida, mostramos el enlace con el icono */}
                {hasValidUrl ? (
                <a
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-contact"
                    aria-label={t("visitProfile", { platform: contact.platform })}
                >
                    <img
                    src={`/icons/${contact.platform}.svg`}
                    alt={contact.platform}
                    className="user-contact__icon"
                    />
                </a>
                ) : (
                /* Si NO es válida, mostramos solo el icono (sin enlace) y el texto */
                <div className="user-contact-invalid">
                    <img
                    src={`/icons/${contact.platform}.svg`}
                    alt={contact.platform}
                    className="user-contact__icon" 
                    />
                    <span className="user-contact__text">
                    {contact.url || contact.platform}
                    </span>
                </div>
                )}
            </div>
            );
        })}
        </div>
  );
}