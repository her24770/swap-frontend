"use client";

import Image from "next/image";
import './ProfilePicture.css';

interface ProfilePictureProps {
    imageUrl?: string; 
    userName: string;  
    size?: 'sm' | 'md' | 'lg'; 
}

export default function ProfilePicture({ imageUrl, userName, size = 'md' }: ProfilePictureProps) {
    const initial = userName.charAt(0).toUpperCase();
    
    const baseClass = `profile-picture profile-picture--${size}`;

    return (
        <div className={baseClass}>
        {imageUrl ? (
            <Image
            src={imageUrl}
            alt={`Foto de perfil de ${userName}`}
            fill
            className="profile-picture__image"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            unoptimized
            />
        ) : (
            <div className="profile-picture__placeholder">
            {initial}
            </div>
        )}
        </div>
    );
}