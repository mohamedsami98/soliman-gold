import React, { useState } from 'react';
import { ShoppingBag, Menu, X, TrendingUp, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types/jewelry';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
  onNavigateToCatalog: (category?: string) => void;
  onOpenGoldRates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onNavigateToCatalog,
  onOpenGoldRates,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Slim Announcement & Live Gold Strip */}
      <div className="bg-[#0D0D0D] border-b border-[#C6A667]/20 text-xs py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[#D5CEBF]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C6A667] animate-pulse" />
            <span className="font-medium text-[#FAF8F3] tracking-wide text-[11px] sm:text-xs">
              {settings.announcementBar}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={onOpenGoldRates}
              className="flex items-center gap-1.5 text-[#C6A667] hover:text-[#E2CCA1] transition-colors cursor-pointer"
              title="اضغط لعرض تفاصيل أسعار الذهب اليوم"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>عيار 21:</span>
              <span className="font-bold">{settings.goldPrices.karat21.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-stone-600">|</span>
              <span>عيار 18:</span>
              <span className="font-bold">{settings.goldPrices.karat18.toLocaleString('ar-EG')} ج.م</span>
            </button>
            <span className="hidden md:inline text-stone-600">·</span>
            <span className="hidden md:inline text-stone-400">
              هاتف المحل: <strong className="text-stone-200 font-mono">0473405032</strong> · واتساب: <strong className="text-[#C6A667] font-mono">01020476773</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Luxury Header with Centered Brand Logo */}
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-[#C6A667]/20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          
          {/* Zone 1 (Right): Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#D8CFBE] w-1/3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0"
            >
              الرئيسية
            </a>
            <button
              onClick={() => onNavigateToCatalog('all')}
              className="hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الكتالوج
            </button>
            <button
              onClick={() => onNavigateToCatalog('latest')}
              className="hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              أحدث القطع
            </button>
            <button
              onClick={() => onNavigateToCatalog('offers')}
              className="hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0 cursor-pointer text-[#C6A667]"
            >
              العروض
            </button>
            <a
              href="#contact-section"
              className="hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0"
            >
              الفروع
            </a>
          </nav>

          {/* Zone 2 (Center): Centered Brand Logo */}
          <div className="flex-1 lg:flex-none flex justify-center text-center py-0.5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center justify-center gap-2.5 sm:gap-3 text-decoration-none select-none"
            >
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="سليمان جولد - SOLIMAN GOLD"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(198,166,103,0.35)] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-['Cinzel',serif] text-base sm:text-lg font-bold tracking-[0.18em] text-gold-gradient uppercase leading-tight">
                  SOLIMAN GOLD
                </span>
                <span className="text-[10px] sm:text-[11px] font-['Cairo',sans-serif] text-[#C6A667] tracking-wider">
                  سليمان جولد للمجوهرات
                </span>
              </div>
            </a>
          </div>

          {/* Zone 3 (Left): Primary Action Group (Cart + Admin + Mobile toggle) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 lg:w-1/3">
            {/* WhatsApp Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181818] border border-[#C6A667]/35 hover:border-[#C6A667] hover:bg-[#202020] transition-all text-xs font-semibold text-[#FAF8F3] cursor-pointer"
              title="سلة استفسارات وطلبات واتساب"
            >
              <ShoppingBag className="w-4 h-4 text-[#C6A667]" />
              <span className="hidden sm:inline">سلة الطلبات</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C6A667] text-[#111111] text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>


            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#181818] border border-stone-800 text-stone-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#151515] border-b border-[#C6A667]/20 px-6 py-4 space-y-3">
            <div className="flex items-center justify-center gap-3 pb-3 border-b border-stone-800">
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="SOLIMAN GOLD"
                className="h-12 w-auto object-contain"
              />
              <div className="text-right">
                <span className="font-['Cinzel',serif] text-sm font-bold tracking-widest text-gold-gradient uppercase block">
                  SOLIMAN GOLD
                </span>
                <span className="text-[10px] text-[#C6A667]">سليمان جولد · تأنقي</span>
              </div>
            </div>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#FAF8F3] hover:text-[#C6A667] text-sm"
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('all');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#FAF8F3] hover:text-[#C6A667] text-sm"
            >
              الكتالوج الكامل (معرض العاج)
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('latest');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#FAF8F3] hover:text-[#C6A667] text-sm"
            >
              أحدث التشكيلات 2026
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('offers');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#C6A667] font-semibold text-sm"
            >
              العروض الخاصة والخصومات
            </button>
            <button
              onClick={() => {
                onOpenGoldRates();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-stone-300 text-sm"
            >
              أسعار الذهب المحدثة وحاسبة المصنعية
            </button>
            <a
              href="#contact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-right py-2 text-stone-300 text-sm"
            >
              عناوين الفروع وأرقام التواصل
            </a>
          </div>
        )}
      </header>
    </>
  );
};
