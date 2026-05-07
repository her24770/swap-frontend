"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Contact } from "../../../../types/comment";
import './UserContact.css';

interface UserContactProps {
    contacts: Contact[];
}

// función para verificar que un url valido para abrir en una nueva pestaña
function isValidUrl(url: string) {
    try {
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
        {contacts.map((contact, index) => (
            <a
            key={index}
            href={isValidUrl(contact.url) ? contact.url : "#"}
            target={isValidUrl(contact.url) ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="user-contact"
            aria-label={t("visitProfile", { platform: contact.platform })}
            >
            <Image
                src={`/icons/${contact.platform}.svg`}
                alt={contact.platform}
                width={20}
                height={20}
                className="user-contact__icon"
                unoptimized
            />
            </a>
        ))}
        </div>
    );
}