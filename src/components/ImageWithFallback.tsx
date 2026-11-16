import React, { useState } from 'react';
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
  containerClassName = 'relative w-full h-full overflow-hidden bg-[#121316]',
  showZoomOnHover = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryIcon = () => {
    switch (category) {
      case 'bullion':
        return <ShieldCheck className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'rings':
        return <Disc className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'wedding-bands':
        return <CircleDot className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'earrings':
        return <Feather className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'bangles':
        return <Circle className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'twin-rings':
        return <Layers className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'pendants':
        return <Award className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'bracelets':
        return <Maximize2 className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'collars':
      case 'sets':
        return <Crown className="w-12 h-12 text-[#D4AF37]/70" />;
      case 'necklaces':
        return <Gem className="w-12 h-12 text-[#D4AF37]/70" />;
      default:
        return <Sparkles className="w-12 h-12 text-[#D4AF37]/70" />;
    }
  };

  return (
    <div className={containerClassName}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-[#14161A] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 border-t-[#D4AF37] animate-spin" />
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
        // Luxury stylized fallback container with gold filigree and category insignia
        <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-[#181A1F] via-[#101214] to-[#0A0B0C] flex flex-col items-center justify-center p-6 text-center border border-[#D4AF37]/15">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            {getCategoryIcon()}
          </div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-1">
            مجوهرات فاخرة
          </span>
          <p className="text-xs text-[#C5BBAA] line-clamp-2 max-w-[200px]">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
};
