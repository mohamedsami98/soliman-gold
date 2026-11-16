import React from 'react';
import { StoreSettings } from '../types/jewelry';
import { Sparkles, Phone, MapPin, Clock, ShieldCheck, MessageCircle, Lock } from 'lucide-react';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface FooterProps {
  settings: StoreSettings;
  onNavigateToCatalog: (category?: string) => void;
  onOpenAdmin: () => void;
  onOpenGoldRates: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateToCatalog,
  onOpenAdmin,
  onOpenGoldRates,
}) => {
  const phone = normalizeWhatsAppNumber(settings.whatsappNumber);

  return (
    <footer id="contact-section" className="bg-[#111111] border-t border-[#C6A667]/25 text-[#BDB5A4] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Mission */}
          <div className="space-y-4 text-right">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="سليمان جولد SOLIMAN GOLD"
                className="h-14 sm:h-16 w-auto object-contain rounded-lg border border-[#C6A667]/25 bg-black/60 p-1 drop-shadow-[0_2px_8px_rgba(198,166,103,0.3)]"
              />
              <div>
                <span className="font-['Cinzel',serif] text-xl font-bold tracking-widest text-gold-gradient uppercase block">
                  SOLIMAN GOLD
                </span>
                <span className="text-[11px] text-[#C6A667] font-medium block">
                  سليمان جولد للمجوهرات · تأنقي
                </span>
              </div>
            </div>
            <p className="text-[#A39987] leading-relaxed text-xs font-light">
              “{settings.tagline}”. نعتز بتقديم مشغولات ذهبية راقية عيار 18 و 21 و 24 مصاغة ببراعة إيطالية وعربية، مع إتاحة المعرض الرقمي والطلب المباشر بكل سلاسة وأمان عبر واتساب.
            </p>
            <div className="flex items-center gap-2 text-[#C6A667] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>مختومة ومعتمدة من مصلحة الدمغة والموازين</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-right">
            <h4 className="text-sm font-bold text-[#FAF8F3] uppercase tracking-wider font-serif">
              مجموعات الكتالوج
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
              <li>
                <button
                  onClick={() => onNavigateToCatalog('bullion')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  سبايك وجنيهات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('rings')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  خواتم
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('wedding-bands')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  دبل ومحابس
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('earrings')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  حلقان
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('bangles')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  أساور وغوايش
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('twin-rings')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  توينزات عرايس
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('pendants')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  تعاليق ودلايات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('bracelets')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  انسيالات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('collars')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  عقد وشبكات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCatalog('necklaces')}
                  className="hover:text-[#C6A667] transition-colors cursor-pointer"
                >
                  سلاسل
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-right">
            <h4 className="text-sm font-bold text-[#FAF8F3] uppercase tracking-wider font-serif">
              الفروع والمواعيد
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C6A667] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#C6A667] shrink-0" />
                <span>{settings.workHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C6A667] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-500">هاتف المحل الأرضي:</span>
                  <a href="tel:0473405032" className="hover:text-[#C6A667] font-mono font-bold text-stone-200">
                    0473405032
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-500">واتساب مباشر وطلبات:</span>
                  <a
                    href={`https://wa.me/${phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#25D366] font-mono font-bold text-emerald-400"
                  >
                    01020476773 (تأكيد فوري)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantees & Gold Advice */}
          <div className="space-y-3 text-right">
            <h4 className="text-sm font-bold text-[#FAF8F3] uppercase tracking-wider font-serif">
              ضمان سليمان جولد
            </h4>
            <p className="text-[#A39987] text-xs leading-relaxed font-light">
              نمنحك فاتورة ضريبية رسمية مدوناً بها الوزن الدقيق والعيار والسعر لضمان حقك الكامل في إعادة البيع أو الاستبدال في أي وقت وفق أسعار السوق الرسمية.
            </p>
            {/* الزر الوحيد المعتمد للوحة التحكم تحت ضمان سليمان جولد */}
            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#C6A667]/40 bg-[#161616] hover:bg-[#202020] hover:border-[#C6A667] text-[#C6A667] hover:text-[#FAF8F3] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm group"
                title="لوحة تحكم وإدارة سليمان جولد"
              >
                <Lock className="w-3.5 h-3.5 text-[#C6A667] group-hover:scale-110 transition-transform" />
                <span>لوحة تحكم المتجر</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {settings.storeName} (سليمان جولد). جميع الحقوق محفوظة.</p>
          <p className="text-stone-500 font-light">
            تصميم وتنفيذ متجر ومعرض رقمي فاخر للذهب والمجوهرات
          </p>
        </div>
      </div>
    </footer>
  );
};
