import React from 'react';
import { MessageCircle, Eye, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';
import { Product, StoreSettings } from '../types/jewelry';
import { formatCurrency, getProductWhatsAppUrl } from '../utils/whatsapp';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  variant?: 'light' | 'dark';
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  variant = 'light',
  onViewDetails,
  onAddToCart,
}) => {
  const whatsappUrl = getProductWhatsAppUrl(product, settings);
  const isLight = variant === 'light';

  return (
    <div
      className={`group relative flex flex-col rounded-xl transition-all duration-300 overflow-hidden ${
        isLight
          ? 'bg-white border border-[#EFE9DD] hover:border-[#C6A667] shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(198,166,103,0.14)] hover:-translate-y-1'
          : 'bg-[#161616] border border-stone-800/90 hover:border-[#C6A667]/60 shadow-lg hover:shadow-[0_10px_30px_rgba(198,166,103,0.1)] hover:-translate-y-1'
      }`}
    >
      {/* Top Image Container */}
      <div
        onClick={() => onViewDetails(product)}
        className={`relative aspect-square w-full cursor-pointer overflow-hidden ${
          isLight ? 'bg-[#F4F1EA]' : 'bg-[#1C1C1C]'
        }`}
      >
        <ImageWithFallback
          src={product.images && product.images[0] ? product.images[0] : ''}
          alt={product.name}
          category={product.category}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Karat Badge top-right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          <span
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold backdrop-blur-md border ${
              isLight
                ? 'bg-white/90 text-[#9E7F43] border-[#C6A667]/40 shadow-sm'
                : 'bg-[#111111]/85 text-[#E2CCA1] border-[#C6A667]/30'
            }`}
          >
            عيار {product.karat}
          </span>
          {product.isOffer && (
            <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#8A3816] text-amber-100 border border-amber-600/40">
              عرض خاص
            </span>
          )}
        </div>

        {/* Availability Badge top-left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {product.inStock ? (
            <span
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] backdrop-blur-md px-2 py-0.5 rounded border ${
                isLight
                  ? 'bg-white/90 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-[#111111]/85 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>متوفر</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] backdrop-blur-md px-2 py-0.5 rounded border ${
                isLight
                  ? 'bg-white/90 text-stone-600 border-stone-300'
                  : 'bg-[#111111]/85 text-stone-400 border-stone-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>بالطلب</span>
            </span>
          )}
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-2 sm:p-2.5 rounded-full bg-white text-[#111111] hover:bg-[#C6A667] hover:text-white transition-all shadow-md cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-2 sm:p-2.5 rounded-full bg-white text-[#111111] hover:bg-[#C6A667] hover:text-white transition-all shadow-md cursor-pointer"
            title="أضف لسلة الطلبات"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 space-y-2.5">
        
        {/* Code & Weight Line */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs">
          <span className={`font-mono text-[10px] sm:text-[11px] ${isLight ? 'text-stone-400' : 'text-stone-400'}`}>
            #{product.code}
          </span>
          {product.weight > 0 && (
            <span className={`font-medium ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
              الوزن الظاهر: <strong className={`${isLight ? 'text-[#8A6A2E]' : 'text-[#C6A667]'} font-mono`}>{product.weight}</strong> جم
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetails(product)}
          className={`text-xs sm:text-sm font-semibold line-clamp-2 leading-snug cursor-pointer transition-colors ${
            isLight
              ? 'text-[#1A1A1A] hover:text-[#C6A667]'
              : 'text-[#FAF8F3] hover:text-[#C6A667]'
          }`}
        >
          {product.name}
        </h3>

        {/* Short description preview */}
        {product.description && (
          <p className={`text-[11px] line-clamp-1 font-light ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
            {product.description}
          </p>
        )}

        {/* Price Area */}
        <div className="pt-0.5">
          {product.hidePrice || settings.hideAllPrices ? (
            <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isLight ? 'text-[#8A6A2E]' : 'text-[#E2CCA1]'}`}>
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>اسأل عن السعر عبر واتساب</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span
                className={`text-sm sm:text-base font-bold font-mono ${
                  isLight ? 'text-[#8A6A2E]' : 'text-gold-gradient'
                }`}
              >
                {formatCurrency(product.price, settings.currency)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[11px] text-stone-400 line-through font-mono">
                  {formatCurrency(product.oldPrice, settings.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions: Details & WhatsApp */}
        <div className="pt-2 mt-auto grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className={`flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-lg border text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'border-stone-200 bg-[#FAF8F3] text-stone-700 hover:border-[#C6A667] hover:text-[#111111]'
                : 'border-stone-800 bg-[#1D1D1D] text-[#D8CFBE] hover:border-[#C6A667]/60 hover:text-[#FAF8F3]'
            }`}
          >
            <Eye className="w-3 h-3 text-stone-400" />
            <span>تفاصيل</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm"
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{product.hidePrice || settings.hideAllPrices ? 'استفسر الآن' : 'واتساب'}</span>
          </a>
        </div>

      </div>
    </div>
  );
};
