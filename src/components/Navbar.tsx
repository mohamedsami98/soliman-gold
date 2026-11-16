import React, { useState } from 'react';
import { ShoppingBag, Menu, X, TrendingUp, Sparkles, Sun, Moon } from 'lucide-react';
import { StoreSettings } from '../types/jewelry';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
  onNavigateToCatalog: (category?: string) => void;
  onOpenGoldRates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  theme,
  onToggleTheme,
  onOpenCart,
  onOpenAdmin,
  onNavigateToCatalog,
  onOpenGoldRates,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Slim Announcement, Live Gold Strip & Theme Switch */}
      <div className="bg-[#F4EFE6] dark:bg-[#15161D] border-b border-[#E8DEC9] dark:border-stone-800 text-xs py-2 px-4 select-none transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8A6A2E] dark:text-[#C6A667] shrink-0" />
            <span className="font-semibold text-[#1A1A1A] dark:text-[#FAF8F3] tracking-wide text-[11px] sm:text-xs">
              {settings.announcementBar}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            <button
              onClick={onOpenGoldRates}
              className="flex items-center gap-1.5 text-[#8A6A2E] dark:text-[#E2CCA1] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="اضغط لعرض تفاصيل أسعار الذهب اليوم"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>عيار 21:</span>
              <span className="font-bold text-[#111111] dark:text-white">{settings.goldPrices.karat21.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-[#D6C9B0] dark:text-stone-700">|</span>
              <span>عيار 18:</span>
              <span className="font-bold text-[#111111] dark:text-white">{settings.goldPrices.karat18.toLocaleString('ar-EG')} ج.م</span>
            </button>
            <span className="hidden md:inline text-[#D6C9B0] dark:text-stone-700">·</span>
            <span className="hidden md:inline text-stone-600 dark:text-stone-400">
              هاتف المحل: <strong className="text-[#111111] dark:text-white font-mono">0473405032</strong> · واتساب: <strong className="text-[#8A6A2E] dark:text-[#C6A667] font-mono">01020476773</strong>
            </span>

            {/* Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              title={theme === 'dark' ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2028] border border-[#E0D6C3] dark:border-[#C6A667]/40 text-[#111111] dark:text-[#FAF8F3] hover:border-[#C6A667] font-['Cairo',sans-serif] font-bold text-[11px] transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E2CCA1]" />
                  <span>فاتح</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#8A6A2E]" />
                  <span>داكن</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Luxury Header with Centered Brand Logo */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-[#E8DEC9] dark:border-stone-800/90 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          
          {/* Zone 1 (Right): Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 w-1/3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#8A6A2E] dark:hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0"
            >
              الرئيسية
            </a>
            <button
              onClick={() => onNavigateToCatalog('all')}
              className="hover:text-[#8A6A2E] dark:hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الكتالوج
            </button>
            <button
              onClick={() => onNavigateToCatalog('latest')}
              className="hover:text-[#8A6A2E] dark:hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              أحدث القطع
            </button>
            <button
              onClick={() => onNavigateToCatalog('offers')}
              className="hover:text-[#111111] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer text-[#8A6A2E] dark:text-[#C6A667] font-bold"
            >
              العروض
            </button>
            <a
              href="#contact-section"
              className="hover:text-[#8A6A2E] dark:hover:text-[#C6A667] transition-colors whitespace-nowrap shrink-0"
            >
              الفروع
            </a>
          </nav>

          {/* Zone 2 (Center): Centered Brand Crest Logo */}
          <div className="flex-1 lg:flex-none flex justify-center text-center py-0.5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center justify-center gap-2.5 sm:gap-3 text-decoration-none select-none"
            >
              <div className="bg-[#111111] p-1 rounded-lg border border-[#C6A667]/50 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <img
                  src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                  alt="سليمان جولد - SOLIMAN GOLD"
                  className="h-10 sm:h-12 md:h-13 w-auto object-contain rounded"
                />
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-['Cinzel',serif] text-base sm:text-lg font-bold tracking-[0.18em] text-gold-gradient uppercase leading-tight">
                  SOLIMAN GOLD
                </span>
                <span className="text-[10px] sm:text-[11px] font-['Cairo',sans-serif] text-[#8A6A2E] dark:text-[#C6A667] font-semibold tracking-wider">
                  سليمان جولد للمجوهرات
                </span>
              </div>
            </a>
          </div>

          {/* Zone 3 (Left): Primary Action Group (Cart + Mobile toggle) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 lg:w-1/3">
            {/* WhatsApp Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FAF8F3] dark:bg-[#1B1D24] border border-[#E0D6C3] dark:border-stone-700 hover:border-[#C6A667] hover:bg-[#F4EFE6] dark:hover:bg-[#232530] transition-all text-xs font-bold text-[#111111] dark:text-[#FAF8F3] cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title="سلة استفسارات وطلبات واتساب"
            >
              <ShoppingBag className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667]" />
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
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#FAF8F3] dark:bg-[#1B1D24] border border-[#E8DEC9] dark:border-stone-700 text-[#111111] dark:text-[#FAF8F3]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F3] dark:bg-[#14151B] border-b border-[#E8DEC9] dark:border-stone-800 px-6 py-4 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E8DEC9] dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="bg-[#111111] p-1 rounded-lg border border-[#C6A667]/50">
                  <img
                    src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                    alt="SOLIMAN GOLD"
                    className="h-10 w-auto object-contain rounded"
                  />
                </div>
                <div className="text-right">
                  <span className="font-['Cinzel',serif] text-sm font-bold tracking-widest text-gold-gradient uppercase block">
                    SOLIMAN GOLD
                  </span>
                  <span className="text-[10px] text-[#8A6A2E] dark:text-[#C6A667] font-semibold">سليمان جولد · تأنقي</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2028] border border-[#E0D6C3] dark:border-[#C6A667]/40 text-xs font-bold text-[#111111] dark:text-[#FAF8F3] cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#E2CCA1]" />
                    <span>فاتح</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#8A6A2E]" />
                    <span>داكن</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#111111] dark:text-[#FAF8F3] hover:text-[#8A6A2E] dark:hover:text-[#C6A667] text-sm font-medium"
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('all');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#111111] dark:text-[#FAF8F3] hover:text-[#8A6A2E] dark:hover:text-[#C6A667] text-sm font-medium"
            >
              الكتالوج الكامل
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('latest');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#111111] dark:text-[#FAF8F3] hover:text-[#8A6A2E] dark:hover:text-[#C6A667] text-sm font-medium"
            >
              أحدث التشكيلات 2026
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog('offers');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-[#8A6A2E] dark:text-[#C6A667] font-bold text-sm"
            >
              العروض الخاصة والخصومات
            </button>
            <button
              onClick={() => {
                onOpenGoldRates();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right py-2 text-stone-700 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white text-sm"
            >
              أسعار الذهب المحدثة وحاسبة المصنعية
            </button>
            <a
              href="#contact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-right py-2 text-stone-700 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white text-sm"
            >
              عناوين الفروع وأرقام التواصل
            </a>
          </div>
        )}
      </header>
    </>
  );
};
