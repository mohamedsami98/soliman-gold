import React, { useState } from 'react';
import { X, TrendingUp, Calculator, ShieldCheck, Sparkles, Scale, Info } from 'lucide-react';
import { StoreSettings } from '../types/jewelry';
import { formatCurrency } from '../utils/whatsapp';

interface GoldRatesModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
}

export const GoldRatesModal: React.FC<GoldRatesModalProps> = ({
  isOpen,
  settings,
  onClose,
}) => {
  // Live client-side Gold Piece Calculator hooks (must run unconditionally)
  const [calcKarat, setCalcKarat] = useState<24 | 21 | 18>(21);
  const [calcWeight, setCalcWeight] = useState<string>('10');
  const [calcCraftFee, setCalcCraftFee] = useState<string>('120');

  if (!isOpen) return null;

  const weightNum = parseFloat(calcWeight) || 0;
  const craftFeeNum = parseFloat(calcCraftFee) || 0;
  const gramPrice =
    calcKarat === 24
      ? settings.goldPrices.karat24
      : calcKarat === 21
      ? settings.goldPrices.karat21
      : settings.goldPrices.karat18;

  const rawGoldCost = weightNum * gramPrice;
  const craftFeeCost = weightNum * craftFeeNum;
  const totalEstimatedCost = rawGoldCost + craftFeeCost;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FAF8F3] dark:bg-[#14151B] border border-[#E8DEC9] dark:border-stone-800 shadow-2xl overflow-hidden my-auto text-[#1A1A1A] dark:text-[#FAF8F3]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DEC9] dark:border-stone-800 bg-[#F4EFE6] dark:bg-[#191B23]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E202A] border border-[#C6A667]/50 flex items-center justify-center text-[#8A6A2E] dark:text-[#C6A667] shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111] dark:text-[#FAF8F3]">بورصة الذهب وحاسبة المصنعية · سليمان جولد</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">{settings.goldPrices.lastUpdated}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1E202A] border border-[#E8DEC9] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Live Official Rates Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#8A6A2E] dark:text-[#E2CCA1] uppercase tracking-wider">
                أسعار الجرام الرسمية بالصاغة المصرية
              </h4>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">بدون مصنعية أو ضريبة</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-xs">
                <span className="block text-xs text-stone-500 dark:text-stone-400 mb-1">عيار 24 (السبائك)</span>
                <span className="text-base font-bold font-mono text-[#111111] dark:text-white">
                  {formatCurrency(settings.goldPrices.karat24, settings.currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FDF8EC] dark:bg-[#201D17] border-2 border-[#C6A667] shadow-sm">
                <span className="block text-xs text-[#8A6A2E] dark:text-[#E2CCA1] font-bold mb-1">عيار 21 (الأكثر مبيعاً)</span>
                <span className="text-base font-bold font-mono text-[#111111] dark:text-white">
                  {formatCurrency(settings.goldPrices.karat21, settings.currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-xs">
                <span className="block text-xs text-stone-500 dark:text-stone-400 mb-1">عيار 18 (المجوهرات)</span>
                <span className="text-base font-bold font-mono text-[#111111] dark:text-white">
                  {formatCurrency(settings.goldPrices.karat18, settings.currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-xs">
                <span className="block text-xs text-stone-500 dark:text-stone-400 mb-1">الجنيه الذهب (8 جم)</span>
                <span className="text-base font-bold font-mono text-[#8A6A2E] dark:text-[#C6A667]">
                  {formatCurrency(settings.goldPrices.goldPound, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111111] dark:text-[#FAF8F3]">
              <Calculator className="w-4 h-4 text-[#8A6A2E] dark:text-[#C6A667]" />
              <span>حاسبة سعر القطعة التقريبي (سعر الذهب + المصنعية)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Karat select */}
              <div>
                <label className="block text-xs text-stone-600 dark:text-stone-300 font-medium mb-1">العيار:</label>
                <select
                  value={calcKarat}
                  onChange={(e) => setCalcKarat(Number(e.target.value) as 24 | 21 | 18)}
                  className="w-full bg-[#FAF8F3] dark:bg-[#121319] border border-[#E0D6C3] dark:border-stone-700 rounded-lg py-2 px-3 text-xs text-[#111111] dark:text-white focus:border-[#C6A667] outline-none"
                >
                  <option value={24}>عيار 24 ({settings.goldPrices.karat24} ج.م)</option>
                  <option value={21}>عيار 21 ({settings.goldPrices.karat21} ج.م)</option>
                  <option value={18}>عيار 18 ({settings.goldPrices.karat18} ج.م)</option>
                </select>
              </div>

              {/* Weight input */}
              <div>
                <label className="block text-xs text-stone-600 dark:text-stone-300 font-medium mb-1">الوزن بالجرام:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full bg-[#FAF8F3] dark:bg-[#121319] border border-[#E0D6C3] dark:border-stone-700 rounded-lg py-2 px-3 text-xs text-[#111111] dark:text-white font-mono focus:border-[#C6A667] outline-none"
                  placeholder="مثال: 12.5"
                />
              </div>

              {/* Craft fee input */}
              <div>
                <label className="block text-xs text-stone-600 dark:text-stone-300 font-medium mb-1">المصنعية التقديرية للجرام:</label>
                <input
                  type="number"
                  min="0"
                  value={calcCraftFee}
                  onChange={(e) => setCalcCraftFee(e.target.value)}
                  className="w-full bg-[#FAF8F3] dark:bg-[#121319] border border-[#E0D6C3] dark:border-stone-700 rounded-lg py-2 px-3 text-xs text-[#111111] dark:text-white font-mono focus:border-[#C6A667] outline-none"
                  placeholder="مثال: 120"
                />
              </div>
            </div>

            {/* Calculation Breakdown Result */}
            <div className="p-4 rounded-lg bg-[#FAF8F3] dark:bg-[#121319] border border-[#E8DEC9] dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>سعر الذهب الخام ({weightNum} جم × {gramPrice} ج.م):</span>
                <span className="font-mono font-semibold text-[#111111] dark:text-white">{formatCurrency(rawGoldCost, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>إجمالي المصنعية والدمغة التقريبية ({weightNum} جم × {craftFeeNum} ج.م):</span>
                <span className="font-mono font-semibold text-[#111111] dark:text-white">{formatCurrency(craftFeeCost, settings.currency)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#E8DEC9] dark:border-stone-800 text-sm font-bold">
                <span className="text-[#111111] dark:text-[#FAF8F3]">السعر الإجمالي التقديري:</span>
                <span className="text-base font-bold font-mono text-[#8A6A2E] dark:text-[#C6A667]">
                  {formatCurrency(totalEstimatedCost, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Legal and transparency note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F4EFE6] dark:bg-[#191B23] border border-[#E8DEC9] dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <Info className="w-5 h-5 text-[#8A6A2E] dark:text-[#C6A667] shrink-0 mt-0.5" />
            <p>
              {settings.priceDisclaimer} المصنعية تختلف من قطعة لأخرى بحسب دقة الصياغة (سادة، ليزر، إيطالي، مرصع بأحجار)، وسيتم تأكيد السعر النهائي الدقيق عبر محادثة واتساب الرسمية مع الفاتورة المعتمدة.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
