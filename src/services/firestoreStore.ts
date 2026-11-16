import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, Category, StoreSettings } from '../types/jewelry';

export interface MediaRecord {
  id: string;
  filename: string;
  url: string;
  size: number;
  productCode?: string;
  uploadedBy: string;
  createdAt?: unknown;
}

export const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';

export const DEFAULT_CATEGORIES: (Category & { order?: number })[] = [
  { id: 'all', name: 'الكل', icon: 'Sparkles', order: 0 },
  {
    id: 'bullion',
    name: 'سبايك',
    icon: 'ShieldCheck',
    description: 'سبائك بي تي سي وسويسري وجنيهات ذهب عيار 24 للاستثمار والادخار',
    order: 1,
  },
  {
    id: 'rings',
    name: 'خواتم',
    icon: 'Disc',
    description: 'خواتم ذهب وسوليتير وتصاميم فخمة عيار 18 و 21',
    order: 2,
  },
  {
    id: 'wedding-bands',
    name: 'دبل',
    icon: 'CircleDot',
    description: 'دبل ومحابس زفاف وخطوبة كلاسيكية وعصرية متقنة الصياغة',
    order: 3,
  },
  {
    id: 'earrings',
    name: 'حلقان',
    icon: 'Feather',
    description: 'حلقان مدلدلة وبريمة بأشكال عصرية ومريحة',
    order: 4,
  },
  {
    id: 'bangles',
    name: 'اساور',
    icon: 'Circle',
    description: 'أساور وغوايش عيار 21 صب ومفرغ بأحدث النقشات المصرية والخليجية',
    order: 5,
  },
  {
    id: 'twin-rings',
    name: 'توينزات',
    icon: 'Layers',
    description: 'توينزات عرايس وأطقم خواتم مزدوجة فائقة البريق',
    order: 6,
  },
  {
    id: 'pendants',
    name: 'تعاليق',
    icon: 'Award',
    description: 'تعاليق ودلايات راقية وماشات بتصاميم إسلامية وتراثية وعصرية',
    order: 7,
  },
  {
    id: 'bracelets',
    name: 'انسيال',
    icon: 'Maximize2',
    description: 'انسيالات ذهب كارتييه وتنس وبارزة بتشطيب ناعم',
    order: 8,
  },
  {
    id: 'collars',
    name: 'عقد',
    icon: 'Crown',
    description: 'أعقاد شوكر وكوليهات ملكية للمناسبات الخاصة والشبكات',
    order: 9,
  },
  {
    id: 'necklaces',
    name: 'سلاسل',
    icon: 'Gem',
    description: 'سلاسل ذهب إيطالي وحبل وسنغافوري بأطوال وأوزان مختلفة',
    order: 10,
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'SOLIMAN GOLD',
  tagline: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
  whatsappNumber: '201020476773',
  phoneNumber: '0473405032',
  address: 'شارع جمال عبدالناصر، قلين المحطة، مركز قلين، كفر الشيخ',
  workHours: 'يوميًا من 11:30 صباحًا حتى 11:00 مساءً',
  currency: 'ج.م',
  heroBannerTitle: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
  heroBannerSubtitle:
    'مجموعات استثنائية من الذهب عيار 18 و 21 و 24 المصاغ بأيدي نخبة الصاغة، نجمع بين بريق الذهب الأصفر وسحر التصاميم العصرية لتخليد أروع لحظاتك.',
  heroBannerBadge: 'مجموعة 2026 الحصرية',
  announcementBar:
    '✨ سليمان جولد SOLIMAN GOLD · تفاصيل صغيرة تصنع فخامة لا تُنسى | اطلب عبر واتساب مباشرة',
  goldPrices: {
    karat24: 4350,
    karat21: 3806,
    karat18: 3262,
    goldPound: 30448,
    lastUpdated: 'اليوم، تحديث فوري لبورصة الصاغة',
  },
  priceDisclaimer:
    'ملاحظة: الأسعار المعروضة استرشادية وقد تتغير طفيفاً وفقاً لحركة سعر الذهب الرسمية ومصنعية القطعة لحظة تأكيد الفاتورة.',
  adminPin: '112233',
  autoCalcPrices: false,
  hideAllPrices: true,
  logoUrl: '/assets/aistudio/logo_20a2cea5.jpeg',
};

// Sanitize ID to conform to ^[a-zA-Z0-9_\-]+$ and max 128 chars
export function sanitizeFirestoreId(raw: string, prefix = 'id'): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
  if (cleaned.length >= 1) return cleaned;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val).trim().slice(0, maxLen);
}

function clampNumber(val: unknown, min: number, max: number, fallback = 0): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function sanitizeImagesList(images: unknown, fallback = DEFAULT_IMAGE_URL): string[] {
  const arr = Array.isArray(images)
    ? images
        .map((img) => clampString(img, 1000))
        .filter((img) => img.length > 0)
        .slice(0, 20)
    : [];
  return arr.length > 0 ? arr : [fallback];
}

export function buildProductUpdateFields(input: Partial<Product>) {
  const code = clampString(input.code, 64, `JWL-${Date.now().toString().slice(-4)}`).toUpperCase();
  const name = clampString(input.name, 300, 'قطعة ذهب');
  const category = clampString(input.category, 64, 'rings');
  const karat = clampNumber(input.karat, 1, 24, 21);
  const weight = clampNumber(input.weight, 0, 100000, 0);
  const price = clampNumber(input.price, 0, 100000000, 0);
  const oldPriceVal =
    input.oldPrice !== undefined && input.oldPrice !== null && String(input.oldPrice) !== ''
      ? clampNumber(input.oldPrice, 0, 100000000, 0)
      : null;

  return {
    code,
    name,
    category,
    karat,
    weight,
    price,
    hidePrice: Boolean(input.hidePrice),
    inStock: input.inStock !== false,
    isFeatured: Boolean(input.isFeatured),
    isNew: Boolean(input.isNew),
    isOffer: Boolean(input.isOffer),
    oldPrice: oldPriceVal,
    description: clampString(input.description, 3000),
    seoTitle: clampString(input.seoTitle, 300),
    images: sanitizeImagesList(input.images),
    craftsmanshipFee: clampNumber(input.craftsmanshipFee, 0, 100000, 0),
    order: clampNumber(input.order, 0, 1000000, 0),
    views: clampNumber(input.views, 0, 100000000, 0),
  };
}

export function normalizeProductFromDoc(docId: string, data: Record<string, any>): Product {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : typeof data.createdAt === 'string'
        ? data.createdAt
        : undefined;
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : typeof data.updatedAt === 'string'
        ? data.updatedAt
        : undefined;

  return {
    id: data.id || docId,
    code: String(data.code || ''),
    name: String(data.name || ''),
    category: String(data.category || 'rings'),
    karat: Number(data.karat) || 21,
    weight: Number(data.weight) || 0,
    price: Number(data.price) || 0,
    hidePrice: Boolean(data.hidePrice),
    inStock: data.inStock !== false,
    isFeatured: Boolean(data.isFeatured),
    isNew: Boolean(data.isNew),
    isOffer: Boolean(data.isOffer),
    oldPrice: data.oldPrice !== undefined && data.oldPrice !== null ? Number(data.oldPrice) : null,
    description: String(data.description || ''),
    seoTitle: String(data.seoTitle || ''),
    images: sanitizeImagesList(data.images),
    craftsmanshipFee: Number(data.craftsmanshipFee) || 0,
    order: Number(data.order) || 0,
    views: Number(data.views) || 0,
    createdAt,
    updatedAt,
  };
}

export async function createProductInFirestore(productInput: Partial<Product>): Promise<Product> {
  const id = sanitizeFirestoreId(
    productInput.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    'prod'
  );
  const fields = buildProductUpdateFields(productInput);
  const path = `products/${id}`;

  try {
    await setDoc(doc(db, 'products', id), {
      id,
      ...fields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id, ...fields };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProductInFirestore(
  productId: string,
  productInput: Partial<Product>
): Promise<void> {
  const id = sanitizeFirestoreId(productId, 'prod');
  const path = `products/${id}`;
  const fields = buildProductUpdateFields(productInput);

  try {
    await updateDoc(doc(db, 'products', id), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductInFirestore(productId: string): Promise<void> {
  const id = sanitizeFirestoreId(productId, 'prod');
  const path = `products/${id}`;

  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllProductsInFirestore(): Promise<number> {
  const collectionPath = 'products';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const docs = snap.docs;
    if (docs.length === 0) return 0;

    // Firestore batch limit is 500 ops; chunk at 400
    const CHUNK_SIZE = 400;
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
    return docs.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionPath);
  }
}

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  bullion: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'wedding-bands': 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
  earrings: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  bangles: 'https://images.unsplash.com/photo-1611591475870-7613763f9b23?auto=format&fit=crop&w=800&q=80',
  'twin-rings': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
  pendants: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  bracelets: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
  collars: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  necklaces: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
  sets: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
};

export interface BulkImportResult {
  addedCount: number;
  updatedCount: number;
  totalCount: number;
}

export async function bulkUpsertProductsInFirestore(
  items: Array<{
    code: string;
    name: string;
    category?: string;
    karat?: number;
    weight?: number;
    price?: number;
    description?: string;
    seoTitle?: string;
    hidePrice?: boolean;
    inStock?: boolean;
    craftsmanshipFee?: number;
    images?: string[];
  }>,
  existingProducts: Product[],
  settings: StoreSettings,
  updateExisting = true
): Promise<BulkImportResult> {
  const existingByCode = new Map<string, Product>();
  for (const p of existingProducts) {
    if (p.code) {
      existingByCode.set(p.code.trim().toUpperCase(), p);
    }
  }

  let addedCount = 0;
  let updatedCount = 0;

  type BatchOp =
    | { type: 'create'; id: string; payload: Record<string, any> }
    | { type: 'update'; id: string; payload: Record<string, any> };

  const ops: BatchOp[] = [];
  let orderCounter = existingProducts.length + 1;

  for (const item of items) {
    const code = clampString(item.code, 64).toUpperCase();
    const name = clampString(item.name, 300);
    if (!code || !name) continue;

    const category = clampString(item.category, 64, 'rings');
    const karat = clampNumber(item.karat, 1, 24, 21);
    const weight = clampNumber(item.weight, 0, 100000, 0);
    const price = clampNumber(item.price, 0, 100000000, 0);
    const existing = existingByCode.get(code);

    if (existing && updateExisting) {
      const updatedFields = buildProductUpdateFields({
        ...existing,
        code,
        name,
        category,
        karat,
        weight,
        price,
        description: item.description ? clampString(item.description, 3000) : existing.description,
        seoTitle: item.seoTitle
          ? clampString(item.seoTitle, 300)
          : existing.seoTitle || `${name} | عيار ${karat} | سليمان جولد`,
        hidePrice: item.hidePrice !== undefined ? Boolean(item.hidePrice) : existing.hidePrice,
        inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
      });

      ops.push({
        type: 'update',
        id: existing.id,
        payload: {
          ...updatedFields,
          updatedAt: serverTimestamp(),
        },
      });
      updatedCount++;
    } else if (!existing) {
      const id = sanitizeFirestoreId(
        `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        'prod'
      );
      const defaultImg = CATEGORY_DEFAULT_IMAGES[category] || DEFAULT_IMAGE_URL;
      const fields = buildProductUpdateFields({
        code,
        name,
        category,
        karat,
        weight,
        price,
        hidePrice: Boolean(settings.hideAllPrices),
        inStock: true,
        isFeatured: false,
        isNew: true,
        isOffer: false,
        oldPrice: null,
        description: item.description
          ? clampString(item.description, 3000)
          : `صياغة ذهبية فاخرة عيار ${karat} وزن ${weight} جم من تشكيلات سليمان جولد SOLIMAN GOLD.`,
        seoTitle: item.seoTitle
          ? clampString(item.seoTitle, 300)
          : `${name} | عيار ${karat} | سليمان جولد`,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [defaultImg],
        craftsmanshipFee: Number(item.craftsmanshipFee) || 0,
        order: orderCounter++,
        views: 0,
      });

      ops.push({
        type: 'create',
        id,
        payload: {
          id,
          ...fields,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
      existingByCode.set(code, { id, ...fields });
      addedCount++;
    }
  }

  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = ops.slice(i, i + CHUNK_SIZE);
      for (const op of chunk) {
        const ref = doc(db, 'products', op.id);
        if (op.type === 'create') {
          batch.set(ref, op.payload);
        } else {
          batch.update(ref, op.payload);
        }
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }

  return {
    addedCount,
    updatedCount,
    totalCount: addedCount + updatedCount,
  };
}

export async function saveStoreSettingsInFirestore(
  newSettings: StoreSettings
): Promise<void> {
  const path = 'settings/store';
  const payload = {
    storeName: clampString(newSettings.storeName, 150, 'SOLIMAN GOLD'),
    tagline: clampString(newSettings.tagline, 300),
    whatsappNumber: clampString(newSettings.whatsappNumber, 30, '201020476773'),
    phoneNumber: clampString(newSettings.phoneNumber, 30),
    address: clampString(newSettings.address, 400),
    workHours: clampString(newSettings.workHours, 200),
    currency: clampString(newSettings.currency, 20, 'ج.م'),
    heroBannerTitle: clampString(newSettings.heroBannerTitle, 300),
    heroBannerSubtitle: clampString(newSettings.heroBannerSubtitle, 1000),
    heroBannerBadge: clampString(newSettings.heroBannerBadge, 100),
    announcementBar: clampString(newSettings.announcementBar, 500),
    goldPrices: {
      karat24: clampNumber(newSettings.goldPrices?.karat24, 0, 1000000, 4350),
      karat21: clampNumber(newSettings.goldPrices?.karat21, 0, 1000000, 3806),
      karat18: clampNumber(newSettings.goldPrices?.karat18, 0, 1000000, 3262),
      goldPound: clampNumber(newSettings.goldPrices?.goldPound, 0, 10000000, 30448),
      lastUpdated: clampString(newSettings.goldPrices?.lastUpdated, 200, 'اليوم'),
    },
    priceDisclaimer: clampString(newSettings.priceDisclaimer, 1000),
    autoCalcPrices: Boolean(newSettings.autoCalcPrices),
    hideAllPrices: Boolean(newSettings.hideAllPrices),
    logoUrl: clampString(newSettings.logoUrl, 500, '/assets/aistudio/logo_20a2cea5.jpeg'),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'settings', 'store'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveAdminPinInFirestore(adminPin: string): Promise<void> {
  const path = 'adminConfig/security';
  const cleanPin = clampString(adminPin, 32, '112233');
  if (cleanPin.length < 4) {
    throw new Error('يجب أن لا يقل رمز الأمان عن 4 أحرف/أرقام');
  }

  try {
    await setDoc(doc(db, 'adminConfig', 'security'), {
      adminPin: cleanPin,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMediaItemInFirestore(item: {
  filename: string;
  url: string;
  size: number;
  productCode?: string;
}): Promise<MediaRecord | null> {
  if (!auth.currentUser) return null;

  const id = sanitizeFirestoreId(
    `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    'media'
  );
  const path = `media/${id}`;
  const payload: Record<string, any> = {
    id,
    filename: clampString(item.filename, 255, 'image.jpg'),
    url: clampString(item.url, 1000),
    size: clampNumber(item.size, 0, 100000000, 0),
    uploadedBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  };
  if (item.productCode) {
    payload.productCode = clampString(item.productCode, 64);
  }

  try {
    await setDoc(doc(db, 'media', id), payload);
    return {
      id,
      filename: payload.filename,
      url: payload.url,
      size: payload.size,
      productCode: payload.productCode,
      uploadedBy: payload.uploadedBy,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Seeds Firestore from existing server/local store_data (or defaults) when Firestore is empty
 * or when admin requests restoring defaults.
 */
export async function seedStoreToFirestore(options: {
  settings?: StoreSettings;
  categories?: Category[];
  products?: Product[];
  adminPin?: string;
  forceOverwriteProducts?: boolean;
}): Promise<{ seededProducts: number }> {
  // 1. Ensure settings/store exists
  const settingsRef = doc(db, 'settings', 'store');
  let settingsSnap;
  try {
    settingsSnap = await getDoc(settingsRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/store');
  }

  const isBrandNewStore = !settingsSnap.exists();

  if (isBrandNewStore || options.forceOverwriteProducts) {
    await saveStoreSettingsInFirestore(options.settings || DEFAULT_STORE_SETTINGS);
  }

  // 2. Ensure adminConfig/security exists
  const securityRef = doc(db, 'adminConfig', 'security');
  let securitySnap;
  try {
    securitySnap = await getDoc(securityRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'adminConfig/security');
  }

  if (!securitySnap.exists()) {
    await saveAdminPinInFirestore(options.adminPin || options.settings?.adminPin || '112233');
  }

  // 3. Seed categories if empty
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      const catsToSeed =
        options.categories && options.categories.length > 0 ? options.categories : DEFAULT_CATEGORIES;
      const batch = writeBatch(db);
      catsToSeed.forEach((cat, idx) => {
        const catId = sanitizeFirestoreId(cat.id, `cat-${idx}`);
        const payload: Record<string, any> = {
          id: catId,
          name: clampString(cat.name, 100),
          order: idx,
        };
        if (cat.icon) payload.icon = clampString(cat.icon, 64);
        if (cat.description) payload.description = clampString(cat.description, 500);
        batch.set(doc(db, 'categories', catId), payload);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'categories');
  }

  // 4. Seed products only on brand-new Firestore store or explicit force restore
  let seededProducts = 0;
  try {
    const prodSnap = await getDocs(collection(db, 'products'));
    if ((isBrandNewStore && prodSnap.empty) || options.forceOverwriteProducts) {
      let sourceProducts = options.products;
      if (!sourceProducts || sourceProducts.length === 0) {
        try {
          const res = await fetch('/api/products');
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            sourceProducts = data.products;
          }
        } catch {
          sourceProducts = [];
        }
      }

      if (sourceProducts && sourceProducts.length > 0) {
        const CHUNK_SIZE = 400;
        for (let i = 0; i < sourceProducts.length; i += CHUNK_SIZE) {
          const batch = writeBatch(db);
          const chunk = sourceProducts.slice(i, i + CHUNK_SIZE);
          for (const p of chunk) {
            const id = sanitizeFirestoreId(p.id || `prod-${Date.now()}`, 'prod');
            const fields = buildProductUpdateFields(p);
            batch.set(doc(db, 'products', id), {
              id,
              ...fields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            seededProducts++;
          }
          await batch.commit();
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }

  return { seededProducts };
}
