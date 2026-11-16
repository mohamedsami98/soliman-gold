export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  karat: number; // 18, 21, 24
  weight: number; // in grams
  price: number; // in EGP
  hidePrice?: boolean; // if true, show "اسأل عن السعر"
  inStock: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  oldPrice?: number | null;
  description: string;
  seoTitle?: string; // SEO / Meta title for search engines and social sharing
  images: string[];
  craftsmanshipFee?: number; // EGP per gram
  order?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface GoldPrices {
  karat24: number;
  karat21: number;
  karat18: number;
  goldPound: number;
  lastUpdated: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  phoneNumber: string;
  address: string;
  workHours: string;
  currency: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
  heroBannerBadge: string;
  announcementBar: string;
  goldPrices: GoldPrices;
  priceDisclaimer: string;
  adminPin: string;
  autoCalcPrices?: boolean;
  hideAllPrices?: boolean; // When true, all product prices are replaced with "اسأل عن السعر عبر واتساب"
  logoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
