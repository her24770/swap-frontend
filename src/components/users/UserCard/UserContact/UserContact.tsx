"use client";

import type { Contact } from "../../../../types/comment";
import './UserContact.css';

interface UserContactProps {
    contacts: Contact[];
}

export default function UserContact({ contacts }: UserContactProps) {
    return (
        <div className="user-contact-group">
        {contacts.map((contact, index) => (
            <a
            key={index}
            href={contact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="user-contact"
            aria-label={`Visitar perfil de ${contact.platform}`}
            >
            <img 
                src={`/icons/${contact.platform}.svg`} 
                alt={contact.platform}
                className="user-contact__icon"
            />
            </a>
        ))}
        </div>
    );
}