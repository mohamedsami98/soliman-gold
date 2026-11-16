import React from 'react';
import { ArrowLeft, Shield, Award, Clock, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types/jewelry';
import { ImageWithFallback } from './ImageWithFallback';

interface HeroBannerProps {
  settings: StoreSettings;
  onExploreCatalog: () => void;
  onExploreOffers: () => void;
  onOpenGoldRates: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreCatalog,
  onExploreOffers,
  onOpenGoldRates,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF8F3] to-[#F4EFE6] dark:from-[#16171E] dark:via-[#111111] dark:to-[#111111] border-b border-[#E8DEC9] dark:border-stone-800/80 transition-colors">
      {/* Subtle warm champagne glow */}
      <div className="absolute top-1/4 right-1/4 w-[420px] h-[420px] bg-[#C6A667]/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[360px] h-[360px] bg-[#E2CCA1]/20 dark:bg-[#C6A667]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-22 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text & Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Elegant metadata kicker with official crest logo */}
            <div className="inline-flex items-center gap-3.5">
              <div className="bg-[#111111] p-1 rounded-lg border border-[#C6A667]/50 shadow-sm">
                <img
                  src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                  alt="SOLIMAN GOLD - تأنقي"
                  className="h-9 sm:h-10 w-auto object-contain rounded"
                />
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#8A6A2E] dark:text-[#E2CCA1] tracking-[0.18em] uppercase">
                <span className="w-6 h-[1.5px] bg-[#C6A667]" />
                <span className="font-['Cinzel',serif]">{settings.heroBannerBadge || 'SOLIMAN GOLD · EXCLUSIVE 2026'}</span>
              </div>
            </div>

            {/* Main Premium Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] dark:text-[#FAF8F3] font-serif leading-[1.25]">
              “تفاصيل صغيرة… <br className="hidden sm:inline" />
              <span className="text-gold-gradient">تصنع فخامة لا تُنسى”</span>
            </h1>

            {/* Luxury Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed font-normal">
              {settings.heroBannerSubtitle ||
                'نصنع لكل قطعة قصة تليق بك. استكشف مجموعتنا الفاخرة من الذهب الخالص عيار 18 و 21 و 24 المصممة بأعلى معايير الصياغة العالمية مع إمكانية الطلب المباشر عبر واتساب.'}
            </p>

            {/* Action Buttons: Gold outlined & Champagne primary buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onExploreCatalog}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#C6A667] hover:bg-[#B89347] text-[#111111] text-sm font-bold tracking-wide cursor-pointer whitespace-nowrap shadow-md shadow-[#C6A667]/25 transition-all"
              >
                <span>اكتشف مجموعتنا</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={onExploreOffers}
                className="gold-outline-btn inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                عروض سليمان جولد
              </button>
            </div>

            {/* Trust pillars */}
            <div className="pt-8 border-t border-[#E8DEC9] dark:border-stone-800 grid grid-cols-3 gap-4 text-xs text-stone-600 dark:text-stone-300 font-medium">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667] shrink-0" />
                <span>دمغات مصرية ودولية معتمدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667] shrink-0" />
                <span>فاتورة رسمية وسعر عادل</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667] shrink-0" />
                <span>تأكيد فوري عبر واتساب</span>
              </div>
            </div>

          </div>

          {/* Luxury Hero Media Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl p-2.5 bg-white dark:bg-[#171820] border border-[#E8DEC9] dark:border-stone-800 shadow-xl shadow-[#9E7F43]/10 dark:shadow-black/50">
              <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-[#F4F1EA] dark:bg-[#1A1C24]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85"
                  alt="مجوهرات سليمان جولد الفاخرة - SOLIMAN GOLD"
                  category="sets"
                  className="w-full h-full object-cover"
                />
                
                {/* Crisp Frosted Showcase Caption */}
                <div className="absolute bottom-4 right-4 left-4 p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-[#14151C]/90 backdrop-blur-md border border-[#E8DEC9] dark:border-[#C6A667]/30 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#8A6A2E] dark:text-[#E2CCA1] font-bold">تشكيلة سليمان جولد الملكية</p>
                      <h4 className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3] mt-0.5">ذهب عيار 21 صياغة إيطالية</h4>
                    </div>
                    <div className="bg-[#111111] p-1 rounded-md border border-[#C6A667]/50 shrink-0">
                      <img
                        src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                        alt="SOLIMAN GOLD"
                        className="h-8 w-auto object-contain rounded-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Gold Price Bar in 4-column KPI strip */}
        <div className="mt-14 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#16171F] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] dark:bg-[#1E2029] border border-[#E8DEC9] dark:border-stone-700 flex items-center justify-center text-[#8A6A2E] dark:text-[#C6A667]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111] dark:text-[#FAF8F3]">بورصة الذهب الرسمية اليوم</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">تحديث دوري لأسعار الصاغة لحظة بلحظة</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 w-full md:w-auto text-center font-mono">
              <div className="px-3 py-2 rounded-lg bg-[#FAF8F3] dark:bg-[#1D1F28] border border-[#E8DEC9] dark:border-stone-800">
                <span className="block text-[11px] text-stone-500 dark:text-stone-400">عيار 24 (السبائك)</span>
                <span className="text-sm font-bold text-[#111111] dark:text-white">
                  {settings.goldPrices.karat24.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              
              <div className="px-3 py-2 rounded-lg bg-[#FDF8EC] dark:bg-[#201D17] border border-[#C6A667] shadow-xs">
                <span className="block text-[11px] text-[#8A6A2E] dark:text-[#E2CCA1] font-bold">عيار 21 (الأكثر طلباً)</span>
                <span className="text-sm font-bold text-[#111111] dark:text-white">
                  {settings.goldPrices.karat21.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="px-3 py-2 rounded-lg bg-[#FAF8F3] dark:bg-[#1D1F28] border border-[#E8DEC9] dark:border-stone-800">
                <span className="block text-[11px] text-stone-500 dark:text-stone-400">عيار 18</span>
                <span className="text-sm font-bold text-[#111111] dark:text-white">
                  {settings.goldPrices.karat18.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="px-3 py-2 rounded-lg bg-[#FAF8F3] dark:bg-[#1D1F28] border border-[#E8DEC9] dark:border-stone-800">
                <span className="block text-[11px] text-stone-500 dark:text-stone-400">الجنيه الذهب (8 جم)</span>
                <span className="text-sm font-bold text-[#8A6A2E] dark:text-[#C6A667]">
                  {settings.goldPrices.goldPound.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <button
              onClick={onOpenGoldRates}
              className="text-xs font-bold text-[#8A6A2E] dark:text-[#E2CCA1] hover:text-[#111111] dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer underline underline-offset-4"
            >
              حاسبة المصنعية والجرام
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};
