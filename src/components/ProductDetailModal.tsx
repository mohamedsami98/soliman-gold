import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  ShoppingBag,
  Share2,
  Check,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Product, StoreSettings } from '../types/jewelry';
import { formatCurrency, getProductWhatsAppUrl } from '../utils/whatsapp';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  relatedProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  relatedProducts,
  onClose,
  onAddToCart,
  onSelectRelated,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset image view and update document SEO title when product changes
  React.useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
    if (product) {
      const prevTitle = document.title;
      const seoHeadline = product.seoTitle || `${product.name} | عيار ${product.karat} | سليمان جولد`;
      document.title = seoHeadline;
      return () => {
        document.title = prevTitle;
      };
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
  ];

  const currentImage = images[activeImageIndex] || images[0];

  const handleShare = () => {
    const url = `${window.location.origin}/?product=${product.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappUrl = getProductWhatsAppUrl(
    product,
    settings,
    typeof window !== 'undefined' ? `${window.location.origin}/?product=${product.code}` : ''
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#FAF8F3] dark:bg-[#14151B] text-[#1A1A1A] dark:text-[#FAF8F3] border border-[#E8DEC9] dark:border-stone-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#EBE3D3] dark:border-stone-800 bg-[#F4EFE6] dark:bg-[#191B23] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#111111] p-0.5 rounded-md border border-[#C6A667]/50 shrink-0">
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="SOLIMAN GOLD"
                className="h-7 w-auto object-contain rounded-xs"
              />
            </div>
            <span className="font-mono text-xs font-bold text-[#9E7F43] dark:text-[#E2CCA1] bg-white dark:bg-[#1E202A] px-3 py-1 rounded-md border border-[#E0D4BE] dark:border-stone-700 shadow-sm">
              #{product.code}
            </span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 hidden sm:inline">
              سليمان جولد · عيار {product.karat}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white dark:bg-[#1E202A] border border-[#E0D4BE] dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-[#C6A667] hover:border-[#C6A667] transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
              title="مشاركة رابط المنتج"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">مشاركة الرابط</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white dark:bg-[#1E202A] border border-[#E0D4BE] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Gallery Column */}
            <div className="space-y-4">
              {/* Main Image with Zoom Preview */}
              <div
                className="relative rounded-xl overflow-hidden aspect-square bg-white dark:bg-[#191B23] border border-[#EBE3D3] dark:border-stone-800 shadow-sm group cursor-pointer"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ImageWithFallback
                  src={currentImage}
                  alt={product.name}
                  category={product.category}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
                  }`}
                  showZoomOnHover={false}
                />

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-white/90 dark:bg-[#14151B]/90 backdrop-blur-sm text-[11px] text-stone-700 dark:text-stone-200 font-medium border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shadow-sm">
                  <Maximize2 className="w-3.5 h-3.5 text-[#C6A667]" />
                  <span>{isZoomed ? 'اضغط للتصغير' : 'انقر للتكبير'}</span>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1B1D26]/90 text-stone-800 dark:text-white shadow-md flex items-center justify-center hover:bg-[#C6A667] hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1B1D26]/90 text-stone-800 dark:text-white shadow-md flex items-center justify-center hover:bg-[#C6A667] hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#C6A667] shadow-md scale-105'
                          : 'border-stone-300 dark:border-stone-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Actions Column */}
            <div className="space-y-6 text-right">
              
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>متوفر في فرع الصاغة وجاهز للاستلام</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-300 dark:border-stone-700">
                      <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      <span>يصنع بالطلب حسب المقاس المفضل</span>
                    </span>
                  )}

                  {/* 3. التصنيف */}
                  {product.category && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#9E7F43] dark:text-[#E2CCA1] bg-[#FAF3E0] dark:bg-[#201D17] px-2.5 py-0.5 rounded-full border border-[#E0D4BE] dark:border-[#C6A667]/40 font-bold">
                      <Sparkles className="w-3 h-3 text-[#C6A667]" />
                      <span>قسم: {product.category}</span>
                    </span>
                  )}
                </div>

                {/* 7. عنوان SEO */}
                {product.seoTitle && (
                  <div className="flex items-center gap-2 text-[11px] text-[#856627] dark:text-[#E2CCA1] bg-amber-50/90 dark:bg-[#201D17] px-3 py-1.5 rounded-lg border border-amber-200/80 dark:border-[#C6A667]/30 font-medium">
                    <span className="font-mono text-[9px] text-stone-600 dark:text-stone-300 font-bold uppercase bg-white dark:bg-[#14151B] px-1.5 py-0.5 rounded border border-amber-200 dark:border-stone-700 shrink-0">
                      عنوان SEO
                    </span>
                    <span className="line-clamp-1 text-stone-800 dark:text-stone-200">{product.seoTitle}</span>
                  </div>
                )}

                {/* 2. اسم المنتج (SEO) */}
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-[#FAF8F3] font-serif leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* 8. السعر (جنيه) */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">السعر (جنيه):</span>
                {product.hidePrice || settings.hideAllPrices ? (
                  <div className="space-y-1.5">
                    <div className="text-lg sm:text-xl font-bold text-[#9E7F43] dark:text-[#E2CCA1] flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
                      <span>اسأل عن السعر اللحظي عبر واتساب</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light">
                      الأسعار تتغير باستمرار وفق بورصة الصاغة اليومية، برجاء التواصل مباشرة لتأكيد سعر القطعة بدقة بالمصنعية.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-[#8A6A2E] dark:text-[#C6A667]">
                      {formatCurrency(product.price, settings.currency)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-stone-400 line-through font-mono">
                        {formatCurrency(product.oldPrice, settings.currency)}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 border-t border-stone-100 dark:border-stone-800 pt-2">
                  * {settings.priceDisclaimer}
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 4. العيار */}
                <div className="p-3 rounded-lg bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                  <span className="text-stone-500 dark:text-stone-400 block mb-0.5">العيار:</span>
                  <span className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3]">
                    عيار {product.karat} قيراط
                  </span>
                </div>

                {/* 5. الوزن الظاهر (جرام) */}
                <div className="p-3 rounded-lg bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                  <span className="text-stone-500 dark:text-stone-400 block mb-0.5">الوزن الظاهر (جرام):</span>
                  <span className="text-sm font-bold text-[#8A6A2E] dark:text-[#C6A667] font-mono">
                    {product.weight > 0 ? `${product.weight} جرام ذهب` : 'حسب المقاس'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                  <span className="text-stone-500 dark:text-stone-400 block mb-0.5">الدمغة والفحص:</span>
                  <span className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3]">
                    مصلحة الدمغة والموازين المصرية
                  </span>
                </div>

                {/* 1. كود المنتج */}
                <div className="p-3 rounded-lg bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                  <span className="text-stone-500 dark:text-stone-400 block mb-0.5">كود المنتج:</span>
                  <span className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3] font-mono">
                    {product.code}
                  </span>
                </div>
              </div>

              {/* 6. وصف مختصر */}
              {product.description && (
                <div className="space-y-1.5 bg-white/70 dark:bg-[#1B1D25] p-4 rounded-xl border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                  <h4 className="text-xs font-bold text-[#9E7F43] dark:text-[#E2CCA1] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C6A667]" />
                    <span>وصف مختصر ومواصفات الصياغة:</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons: Prominent WhatsApp CTA & Cart */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    {product.hidePrice || settings.hideAllPrices
                      ? 'استفسر عن السعر الآن عبر واتساب'
                      : 'اطلب الآن عبر واتساب'}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#C6A667] hover:bg-[#FAF8F3] dark:hover:bg-[#242733] text-[#111111] dark:text-[#FAF8F3] font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C6A667]" />
                  <span>إضافة إلى سلة طلبات واتساب</span>
                </button>
              </div>

            </div>

          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-[#E8DEC9] dark:border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3] font-serif">
                قطع أخرى مقترحة من تشكيلة سليمان جولد
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 hover:border-[#C6A667] shadow-sm cursor-pointer transition-all group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#F4F1EA] dark:bg-[#14151B] mb-2">
                      <ImageWithFallback
                        src={rel.images && rel.images[0] ? rel.images[0] : ''}
                        alt={rel.name}
                        category={rel.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#111111] dark:text-[#FAF8F3] line-clamp-1 group-hover:text-[#C6A667]">
                      {rel.name}
                    </p>
                    <span className="text-[11px] font-mono text-[#8A6A2E] dark:text-[#C6A667] font-bold">
                      {rel.hidePrice ? 'اسأل عن السعر' : formatCurrency(rel.price, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
