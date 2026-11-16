import { Product, CartItem, StoreSettings } from '../types/jewelry';

/**
 * Normalizes phone number for WhatsApp wa.me links
 * Handles Egyptian numbers (01xxxxxxxxx -> 201xxxxxxxxx) and international codes
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `20${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Formats price in Egyptian Pounds with thousands separator
 */
export function formatCurrency(amount: number, currency: string = 'ج.م'): string {
  if (isNaN(amount) || amount === 0) return '0 ' + currency;
  return `${amount.toLocaleString('ar-EG')} ${currency}`;
}

/**
 * Generates direct single product inquiry WhatsApp URL matching exact user specifications
 */
export function getProductWhatsAppUrl(
  product: Product,
  settings: StoreSettings,
  currentUrl?: string
): string {
  const phone = normalizeWhatsAppNumber(settings.whatsappNumber);
  const link = currentUrl || (typeof window !== 'undefined' ? `${window.location.origin}/?product=${product.code}` : '');

  const isPriceHidden = Boolean(product.hidePrice || settings.hideAllPrices);
  const priceText = isPriceHidden
    ? 'السعر عند الاستفسار اليوم'
    : formatCurrency(product.price, settings.currency);

  const weightText = product.weight > 0 ? `${product.weight} جرام تقريبًا` : 'حسب المقاس';

  const message = `مرحبًا ${settings.storeName}، أرغب في الاستفسار عن سعر وتوفر المنتج التالي:

اسم المنتج: ${product.name}
كود المنتج: ${product.code}
العيار: عيار ${product.karat}
الوزن: ${weightText}
السعر: ${priceText}
رابط المنتج: ${link}

برجاء تأكيد السعر اللحظي الدقيق والتوفر والمصنعية وفق سعر الذهب اليوم.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp URL for entire inquiry cart
 */
export function getCartWhatsAppUrl(
  cart: CartItem[],
  settings: StoreSettings,
  totalWeight: number,
  totalPrice: number
): string {
  const phone = normalizeWhatsAppNumber(settings.whatsappNumber);
  const link = typeof window !== 'undefined' ? window.location.origin : '';
  const isAllHidden = Boolean(settings.hideAllPrices);

  let itemsList = '';
  cart.forEach((item, index) => {
    const isItemPriceHidden = isAllHidden || Boolean(item.product.hidePrice);
    const itemPrice = isItemPriceHidden
      ? 'السعر عند الاستفسار اليوم'
      : formatCurrency(item.product.price * item.quantity, settings.currency);
    const itemWeight = item.product.weight > 0 ? `${item.product.weight * item.quantity} جم` : 'غير محدد';

    itemsList += `\n${index + 1}) ${item.product.name}\n` +
      `   • الكود: ${item.product.code} | العيار: ${item.product.karat}\n` +
      `   • الكمية: ${item.quantity} | الوزن الإجمالي: ${itemWeight}\n` +
      `   • السعر: ${itemPrice}\n`;
  });

  const totalSummary = isAllHidden
    ? '💰 السعر الإجمالي: يتم حسابه وتأكيده وفق سعر الذهب اليوم والمصنعية عبر محادثة واتساب'
    : `💰 الإجمالي الاسترشادي: ${formatCurrency(totalPrice, settings.currency)}`;

  const message = `مرحبًا ${settings.storeName}،
أرغب في الاستفسار وتأكيد طلب المنتجات التالية من الكتالوج الرقمي:
${itemsList}
----------------------------------------
⚖️ إجمالي الوزن التقريبي: ${totalWeight.toFixed(2)} جرام
${totalSummary}

رابط المتجر: ${link}

برجاء تأكيد توفر القطع والسعر النهائي والمصنعية وفق سعر الذهب اليوم. شكرًا لكم!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
