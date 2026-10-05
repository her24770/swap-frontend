"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import './ProfilePicture.css';

interface ProfilePictureProps {
    imageUrl?: string;
    userName: string;
    size?: 'sm' | 'md' | 'lg';
}

function getInitials(userName: string): string {
    const words = userName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function ProfilePicture({ imageUrl, userName, size = 'md' }: ProfilePictureProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [imageUrl]);

    const initials = getInitials(userName);
    const showImage = Boolean(imageUrl) && !hasError;

    const baseClass = `profile-picture profile-picture--${size}`;

    return (
        <div className={baseClass}>
        {showImage ? (
            <Image
            src={imageUrl as string}
            alt={`Foto de perfil de ${userName}`}
            fill
            className="profile-picture__image"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            unoptimized
            onError={() => setHasError(true)}
            />
        ) : (
            <div className="profile-picture__placeholder">
            {initials}
            </div>
        )}
        </div>
    );
}
