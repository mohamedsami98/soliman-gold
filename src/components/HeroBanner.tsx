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
    <section className="relative overflow-hidden bg-[#111111] border-b border-[#C6A667]/20">
      {/* Subtle ambient champagne gold illumination */}
      <div className="absolute top-1/4 right-1/4 w-[420px] h-[420px] bg-[#C6A667]/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[360px] h-[360px] bg-[#C6A667]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text & Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Elegant metadata kicker with official logo */}
            <div className="inline-flex items-center gap-3.5">
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="SOLIMAN GOLD - تأنقي"
                className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(198,166,103,0.35)]"
              />
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C6A667] tracking-[0.18em] uppercase">
                <span className="w-6 h-[1px] bg-[#C6A667]" />
                <span className="font-['Cinzel',serif]">{settings.heroBannerBadge || 'SOLIMAN GOLD · EXCLUSIVE 2026'}</span>
              </div>
            </div>

            {/* Main Premium Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F3] font-serif leading-[1.25]">
              “تفاصيل صغيرة… <br className="hidden sm:inline" />
              <span className="text-gold-gradient">تصنع فخامة لا تُنسى”</span>
            </h1>

            {/* Luxury Subtitle */}
            <p className="text-base sm:text-lg text-[#C7BEAF] max-w-2xl leading-relaxed font-light">
              {settings.heroBannerSubtitle ||
                'نصنع لكل قطعة قصة تليق بك. استكشف مجموعتنا الفاخرة من الذهب الخالص عيار 18 و 21 و 24 المصممة بأعلى معايير الصياغة العالمية مع إمكانية الطلب المباشر عبر واتساب.'}
            </p>

            {/* Action Buttons: Gold outlined button “اكتشف مجموعتنا” */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onExploreCatalog}
                className="gold-outline-btn group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg text-sm font-bold tracking-wide cursor-pointer whitespace-nowrap"
              >
                <span>اكتشف مجموعتنا</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={onExploreOffers}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-stone-800 bg-[#161616] text-[#E0D5C3] hover:text-[#FAF8F3] hover:border-[#C6A667]/50 hover:bg-[#1E1E1E] text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                عروض سليمان جولد
              </button>
            </div>

            {/* Trust pillars with clean unboxed typography */}
            <div className="pt-8 border-t border-stone-800/80 grid grid-cols-3 gap-4 text-xs text-[#A89F8D]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C6A667] shrink-0" />
                <span>دمغات مصرية ودولية معتمدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C6A667] shrink-0" />
                <span>فاتورة رسمية وسعر عادل</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C6A667] shrink-0" />
                <span>تأكيد فوري عبر واتساب</span>
              </div>
            </div>

          </div>

          {/* Large Cinematic Hero Media Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl p-2.5 bg-gradient-to-b from-[#C6A667]/35 via-[#232019] to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-[#161616]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85"
                  alt="مجوهرات سليمان جولد الفاخرة - SOLIMAN GOLD"
                  category="sets"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-85" />
                
                {/* Floating subtle showcase badge */}
                <div className="absolute bottom-5 right-5 left-5 p-3.5 sm:p-4 rounded-xl bg-[#141414]/90 backdrop-blur-md border border-[#C6A667]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#C6A667] font-semibold">تشكيلة سليمان جولد الملكية</p>
                      <h4 className="text-sm font-bold text-[#FAF8F3] mt-0.5">ذهب عيار 21 صياغة إيطالية</h4>
                    </div>
                    <img
                      src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                      alt="SOLIMAN GOLD"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Gold Price Bar in 4-column KPI strip */}
        <div className="mt-14 p-4 sm:p-5 rounded-xl bg-[#161616] border border-[#C6A667]/25 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C6A667]/10 border border-[#C6A667]/30 flex items-center justify-center text-[#C6A667]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FAF8F3]">بورصة الذهب الرسمية اليوم</h3>
                <p className="text-xs text-stone-400">تحديث دوري لأسعار الصاغة لحظة بلحظة</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full md:w-auto text-center font-mono">
              <div className="px-3 py-2 rounded-lg bg-[#1D1D1D] border border-stone-800">
                <span className="block text-[11px] text-stone-400">عيار 24 (السبائك)</span>
                <span className="text-sm font-bold text-[#FAF8F3]">
                  {settings.goldPrices.karat24.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              
              <div className="px-3 py-2 rounded-lg bg-[#221F17] border border-[#C6A667]/40 shadow-[0_0_15px_rgba(198,166,103,0.1)]">
                <span className="block text-[11px] text-[#C6A667] font-semibold">عيار 21 (الأكثر طلباً)</span>
                <span className="text-sm font-bold text-[#FAF8F3]">
                  {settings.goldPrices.karat21.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="px-3 py-2 rounded-lg bg-[#1D1D1D] border border-stone-800">
                <span className="block text-[11px] text-stone-400">عيار 18</span>
                <span className="text-sm font-bold text-[#FAF8F3]">
                  {settings.goldPrices.karat18.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="px-3 py-2 rounded-lg bg-[#1D1D1D] border border-stone-800">
                <span className="block text-[11px] text-stone-400">الجنيه الذهب (8 جم)</span>
                <span className="text-sm font-bold text-[#E2CCA1]">
                  {settings.goldPrices.goldPound.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <button
              onClick={onOpenGoldRates}
              className="text-xs font-semibold text-[#C6A667] hover:text-[#E2CCA1] transition-colors whitespace-nowrap cursor-pointer underline underline-offset-4"
            >
              حاسبة المصنعية والجرام
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};
