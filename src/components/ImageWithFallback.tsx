import React, { useState, useEffect } from 'react';
import { Sparkles, Gem, Disc, Circle, Crown, ShieldCheck, CircleDot, Layers, Award, Maximize2, Feather } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  containerClassName?: string;
  showZoomOnHover?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  category = 'rings',
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden bg-[#F4F1EA] dark:bg-[#1B1D24]',
  showZoomOnHover = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const getCategoryIcon = () => {
    switch (category) {
      case 'bullion':
        return <ShieldCheck className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'rings':
        return <Disc className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'wedding-bands':
        return <CircleDot className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'earrings':
        return <Feather className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'bangles':
        return <Circle className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'twin-rings':
        return <Layers className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'pendants':
        return <Award className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'bracelets':
        return <Maximize2 className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'collars':
      case 'sets':
        return <Crown className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      case 'necklaces':
        return <Gem className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
      default:
        return <Sparkles className="w-12 h-12 text-[#8A6A2E] dark:text-[#C6A667]" />;
    }
  };

  return (
    <div className={containerClassName}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-[#EFE9DD] dark:bg-[#1B1D24] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-[#C6A667]/40 border-t-[#9E7F43] dark:border-t-[#C6A667] animate-spin" />
        </div>
      )}

      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`${className} transition-transform duration-700 ease-out ${
            showZoomOnHover ? 'group-hover:scale-108' : ''
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : (
        // Luxury stylized fallback container with gold insignia
        <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-[#FAF8F3] via-[#F4EFE6] to-[#EFE8D8] dark:from-[#1A1B22] dark:via-[#14151B] dark:to-[#101116] flex flex-col items-center justify-center p-6 text-center border border-[#E8DEC9] dark:border-stone-800">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1E2028] border border-[#C6A667]/40 flex items-center justify-center mb-3 shadow-sm">
            {getCategoryIcon()}
          </div>
          <span className="text-xs uppercase tracking-widest text-[#8A6A2E] dark:text-[#E2CCA1] font-semibold mb-1">
            مجوهرات فاخرة
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 max-w-[200px]">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
};
