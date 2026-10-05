"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Contact } from "../../../../types/comment";
import './UserContact.css';

interface UserContactProps {
  contacts: Contact[];
}

/**
 * Fix BG-08: antes se usaba `new URL(contact.url)` para "validar" el valor
 * crudo que el usuario escribió y luego se ponía directo en `href`. El
 * constructor URL de JS acepta javascript:, data: y file: como
 * sintácticamente válidos — así que esos terminaban renderizados como
 * enlaces clicables.
 *
 * En vez de validar el valor del usuario, construimos el href nosotros: el
 * esquema (tel:/https:/mailto:) siempre lo elegimos según la plataforma, y
 * el valor del usuario solo aporta la parte después del esquema, limpiando
 * caracteres que no correspondan al tipo de dato esperado. Así el esquema
 * nunca queda bajo control del usuario, sea cual sea el valor que haya
 * guardado.
 */
function construirHref(contact: Contact): string | null {
    const valor = contact.url.trim();
    if (!valor) return null;

    switch (contact.platform) {
        case "telefono": {
            const digitos = valor.replace(/[^\d+]/g, "");
            return digitos ? `tel:${digitos}` : null;
        }
        case "whatsapp": {
            const digitos = valor.replace(/\D/g, "");
            return digitos ? `https://wa.me/${digitos}` : null;
        }
        case "instagram": {
            // Si ya viene como URL http(s) de instagram, se respeta tal cual;
            // si no, se trata como @usuario.
            if (/^https?:\/\//i.test(valor)) {
                try {
                    const url = new URL(valor);
                    if (url.protocol === "http:" || url.protocol === "https:") {
                        return url.toString();
                    }
                } catch {
                    // sigue al fallback de abajo
                }
            }
            const usuario = valor.replace(/^@+/, "").replace(/[^\w.]/g, "");
            return usuario ? `https://instagram.com/${usuario}` : null;
        }
        case "correo_personal": {
            // El backend ya valida formato de contacto; igual quitamos
            // espacios por si acaso antes de armar el mailto.
            const correo = valor.replace(/\s+/g, "");
            return correo ? `mailto:${correo}` : null;
        }
        default:
            return null;
    }
}

export default function UserContact({ contacts }: UserContactProps) {
    const t = useTranslations("common.aria");

    return (
        <div className="user-contact-group">
        {contacts.map((contact, index) => {
            const href = construirHref(contact);

            return (
            <div className="user-contact-wrapper" key={index}>
                {href ? (
                <a
                    href={href}
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
                /* Si no se pudo construir un enlace seguro, mostramos solo el icono (sin enlace) y el texto */
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