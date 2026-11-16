import React from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { CartItem, StoreSettings } from '../types/jewelry';
import { formatCurrency, getCartWhatsAppUrl } from '../utils/whatsapp';
import { ImageWithFallback } from './ImageWithFallback';

interface WhatsAppCartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  settings: StoreSettings;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const WhatsAppCartDrawer: React.FC<WhatsAppCartDrawerProps> = ({
  isOpen,
  cart,
  settings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const isAllHidden = Boolean(settings.hideAllPrices);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalWeight = cart.reduce((acc, item) => acc + (item.product.weight || 0) * item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + (isAllHidden || item.product.hidePrice ? 0 : item.product.price * item.quantity),
    0
  );

  const hasHiddenPrices = isAllHidden || cart.some((item) => item.product.hidePrice);
  const whatsappUrl = getCartWhatsAppUrl(cart, settings, totalWeight, totalPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="relative w-screen max-w-md bg-[#FAF8F3] dark:bg-[#14151B] border-r border-[#E8DEC9] dark:border-stone-800 shadow-2xl flex flex-col text-[#1A1A1A] dark:text-[#FAF8F3]">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E8DEC9] dark:border-stone-800 bg-[#F4EFE6] dark:bg-[#191B23] shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#111111] p-1 rounded-md border border-[#C6A667]/50 shrink-0">
                <img
                  src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                  alt="SOLIMAN GOLD"
                  className="h-8 w-auto object-contain rounded-xs"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111] dark:text-[#FAF8F3]">سلة طلبات سليمان جولد</h3>
                <span className="text-xs text-stone-600 dark:text-stone-400">
                  {totalItems > 0 ? `${totalItems} منتج تم اختياره` : 'السلة فارغة'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                  title="تفريغ السلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1E202A] border border-[#E8DEC9] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-600 dark:text-stone-400">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 flex items-center justify-center text-[#8A6A2E] dark:text-[#C6A667] shadow-xs">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3]">سلة استفساراتك فارغة حاليًا</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                    تصفح الكتالوج وأضف القطع التي تعجبك لإرسال طلب استفسار موحد ومباشر لصاحب المحل عبر واتساب
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#C6A667] text-[#111111] text-xs font-bold hover:bg-[#B89347] transition-colors cursor-pointer shadow-xs"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 hover:border-[#C6A667] transition-colors flex gap-3.5 items-center shadow-xs"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F4F1EA] dark:bg-[#14151B] shrink-0 border border-[#E8DEC9] dark:border-stone-800">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      category={item.product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-right">
                    <span className="font-mono text-[10px] text-[#8A6A2E] dark:text-[#C6A667] font-bold block">
                      #{item.product.code} · عيار {item.product.karat}
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] dark:text-[#FAF8F3] truncate">
                      {item.product.name}
                    </h4>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-[#8A6A2E] dark:text-[#E2CCA1] font-mono">
                        {item.product.hidePrice || settings.hideAllPrices
                          ? 'استفسار عبر واتساب'
                          : formatCurrency(item.product.price * item.quantity, settings.currency)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-[#FAF8F3] dark:bg-[#121319] rounded-md border border-[#E0D6C3] dark:border-stone-700 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white rounded hover:bg-[#EFE9DD] dark:hover:bg-stone-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-[#111111] dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white rounded hover:bg-[#EFE9DD] dark:hover:bg-stone-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Totals & Send WhatsApp CTA */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E8DEC9] dark:border-stone-800 bg-white dark:bg-[#191B23] shrink-0 space-y-4">
              
              {/* Summary Metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>إجمالي وزن الذهب المقدر:</span>
                  <span className="font-mono text-[#111111] dark:text-white font-bold">
                    {totalWeight.toFixed(2)} جرام
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#E8DEC9] dark:border-stone-800 text-sm">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">السعر الإجمالي:</span>
                  <div className="text-right">
                    {isAllHidden ? (
                      <span className="text-sm font-bold text-[#8A6A2E] dark:text-[#C6A667]">
                        استفسار مباشر وتأكيد عبر واتساب
                      </span>
                    ) : (
                      <>
                        <span className="text-lg font-bold font-mono text-[#111111] dark:text-white">
                          {formatCurrency(totalPrice, settings.currency)}
                        </span>
                        {hasHiddenPrices && (
                          <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                            + قطع تحدد أسعارها عند التواصل
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Informational note */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FAF8F3] dark:bg-[#121319] border border-[#E8DEC9] dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
                <AlertCircle className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667] shrink-0 mt-0.5" />
                <span>
                  لا يتطلب الدفع إلكترونيًا. سيتم إنشاء رسالة واتساب واحدة مفصلة بكل الأكواد لتأكيد الفاتورة مع المحل مباشرة.
                </span>
              </div>

              {/* Primary WhatsApp Action */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7569] text-white font-bold text-sm shadow-lg shadow-[#25D366]/20 transition-all text-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال الطلب عبر واتساب ({totalItems} قطع)</span>
              </a>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
