import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types/jewelry';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const phone = normalizeWhatsAppNumber(settings.whatsappNumber);
  const message = `مرحبًا ${settings.storeName}، أود الاستفسار عن تشكيلات الذهب والمجوهرات المتوفرة لديكم وأسعار الذهب اليوم.`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <aside aria-label="WhatsApp Quick Contact" className="fixed bottom-6 left-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مباشر عبر واتساب"
        className="group flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          تواصل مباشر مع الصائغ
        </span>
      </a>
    </aside>
  );
};
