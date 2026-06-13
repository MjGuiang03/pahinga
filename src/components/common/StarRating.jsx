import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, onRatingChange, className = '' }) {
  const stars = Array.from({ length: max }, (_, idx) => idx + 1);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((star) => {
        const fill = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
          >
            <Star
              className={`w-5 h-5 ${
                fill
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
