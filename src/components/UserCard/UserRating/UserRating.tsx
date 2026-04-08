"use client";

import { Star } from "lucide-react";
import './UserRating.css';

interface UserRatingProps {
    score: number;      
    totalReviews: number; 
}

export default function UserRating({ score, totalReviews }: UserRatingProps) {
    return (
        <div className="user-rating">
        <div className="user-rating__stars">
            {[...Array(5)].map((_, index) => {
            // El índice empieza en 0, así que sumamos 1 para comparar (1 a 5)
            const starNumber = index + 1;
            
            return (
                <Star
                key={index}
                size={20}
                // Si el número de estrella es menor o igual al score, la pintamos
                className={starNumber <= score ? "star--filled" : "star--empty"}
                // 'fill' define el color de relleno, 'currentColor' toma el color del CSS
                fill={starNumber <= score ? "currentColor" : "none"} 
                strokeWidth={2}
                />
            );
            })}
        </div>
        <span className="user-rating__count">({totalReviews} reseñas)</span>
        </div>
  );
}