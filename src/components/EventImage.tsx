import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface EventImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const EventImage: React.FC<EventImageProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#131C38] to-[#1E1B4B] text-slate-400 p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Calendar className="w-8 h-8 text-[#3B82F6]/60 mb-2" aria-hidden="true" />
        <span className="text-xs text-center text-slate-400 line-clamp-2 max-w-[200px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
