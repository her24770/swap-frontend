"use client";

import ProfilePicture from "./ProfilePicture/ProfilePicture";
import UserRating from "./UserRating/UserRating";
import UserContact from "./UserContact/UserContact";
import './UserCard.css';

interface UserCardProps {
    name: string;
    description: string;
    imageUrl?: string;
    rating: number;
    totalReviews: number;
    contacts: { platform: 'instagram' | 'whatsapp' | 'linkedin'; url: string }[];
}

export default function UserCard({ 
    name, 
    description, 
    imageUrl, 
    rating, 
    totalReviews, 
    contacts 
}: UserCardProps) {
    return (
        <section className="user-card">
        {/* Lado Izquierdo: Foto y Calificación */}
        <div className="user-card__identity">
            <ProfilePicture imageUrl={imageUrl} userName={name} size="lg" />
            <div className="user-card__rating-wrapper">
            <UserRating score={rating} totalReviews={totalReviews} />
            </div>
        </div>

        {/* Lado Derecho: Información y Contacto */}
        <div className="user-card__body">
            <div className="user-card__main-info">
            <h1 className="user-card__name">{name}</h1>
            <p className="user-card__description">{description}</p>
            </div>
            
            <div className="user-card__contact-section">
            <h2 className="user-card__contact-title">Contacto</h2>
            <UserContact contacts={contacts} />
            </div>
        </div>
        </section>
    );
}