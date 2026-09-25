import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onChange, size = 'md', readonly = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
