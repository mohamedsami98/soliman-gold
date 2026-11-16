import React from 'react';
import { Category } from '../types/jewelry';
import {
  Circle,
  Disc,
  CircleDot,
  Feather,
  Layers,
  Award,
  Maximize2,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CategoriesBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  bullion: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80',
  'wedding-bands': 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=400&q=80',
  earrings: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80',
  bangles: 'https://images.unsplash.com/photo-1611591475870-7613763f9b23?auto=format&fit=crop&w=400&q=80',
  'twin-rings': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=400&q=80',
  pendants: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
  bracelets: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=400&q=80',
  collars: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
  necklaces: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80',
  sets: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
};

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'bullion':
        return <ShieldCheck className="w-5 h-5" />;
      case 'rings':
        return <Disc className="w-5 h-5" />;
      case 'wedding-bands':
        return <CircleDot className="w-5 h-5" />;
      case 'earrings':
        return <Feather className="w-5 h-5" />;
      case 'bangles':
        return <Circle className="w-5 h-5" />;
      case 'twin-rings':
        return <Layers className="w-5 h-5" />;
      case 'pendants':
        return <Award className="w-5 h-5" />;
      case 'bracelets':
        return <Maximize2 className="w-5 h-5" />;
      case 'collars':
      case 'sets':
        return <Crown className="w-5 h-5" />;
      case 'necklaces':
        return <Gem className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const displayCategories = categories.filter((c) => c.id !== 'all');

  return (
    <section className="py-12 bg-[#111111] border-b border-[#C6A667]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 text-right">
          <div>
            <span className="text-xs font-semibold text-[#C6A667] uppercase tracking-widest block mb-1">
              تشكيلات سليمان جولد
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FAF8F3] font-serif">
              أقسام الذهب والمجوهرات (10 أقسام متخصصة)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory('all')}
              className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'border-[#C6A667] bg-[#C6A667] text-[#111111] font-bold shadow-md'
                  : 'border-stone-800 bg-[#161616] text-[#D5CEBF] hover:border-[#C6A667]/60 hover:text-white'
              }`}
            >
              عرض كل المعروضات
            </button>
            <p className="hidden md:block text-xs sm:text-sm text-[#B8AE9D] max-w-sm font-light">
              انتقاءات استثنائية من أرقى ورش الصاغة بتصاميم تناسب كل مناسبة
            </p>
          </div>
        </div>

        {/* Categories Grid (10 columns on xl, 5 on md/lg, 3 on sm, 2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5 sm:gap-3">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const bgImg = CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES.rings;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all cursor-pointer overflow-hidden min-h-[105px] ${
                  isSelected
                    ? 'border-[#C6A667] bg-gradient-to-b from-[#252016] to-[#181818] shadow-[0_0_20px_rgba(198,166,103,0.3)] scale-[1.02]'
                    : 'border-stone-800/90 bg-[#161616] hover:border-[#C6A667]/50 hover:bg-[#1C1C1C]'
                }`}
              >
                {bgImg && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-25 transition-opacity duration-300"
                    style={{ backgroundImage: `url(${bgImg})` }}
                  />
                )}

                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 ${
                    isSelected
                      ? 'bg-[#C6A667] text-[#111111] shadow-sm'
                      : 'bg-[#212121] text-[#C6A667] group-hover:bg-[#28251E]'
                  }`}
                >
                  {getIcon(cat.id)}
                </div>

                <span
                  className={`relative z-10 text-xs font-bold leading-tight ${
                    isSelected ? 'text-[#FAF8F3]' : 'text-[#D5CEBF] group-hover:text-[#FAF8F3]'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
