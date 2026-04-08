"use client";

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
            <img 
            src={imageUrl} 
            alt={`Foto de perfil de ${userName}`} 
            className="profile-picture__image"
            loading="lazy"
            />
        ) : (
            <div className="profile-picture__placeholder">
            {initial}
            </div>
        )}
        </div>
    );
}