import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');

// Initial default categories (10 requested categories)
const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'Sparkles' },
  { id: 'bullion', name: 'سبايك', icon: 'ShieldCheck', description: 'سبائك بي تي سي وسويسري وجنيهات ذهب عيار 24 للاستثمار والادخار' },
  { id: 'rings', name: 'خواتم', icon: 'Disc', description: 'خواتم ذهب وسوليتير وتصاميم فخمة عيار 18 و 21' },
  { id: 'wedding-bands', name: 'دبل', icon: 'CircleDot', description: 'دبل ومحابس زفاف وخطوبة كلاسيكية وعصرية متقنة الصياغة' },
  { id: 'earrings', name: 'حلقان', icon: 'Feather', description: 'حلقان مدلدلة وبريمة بأشكال عصرية ومريحة' },
  { id: 'bangles', name: 'اساور', icon: 'Circle', description: 'أساور وغوايش عيار 21 صب ومفرغ بأحدث النقشات المصرية والخليجية' },
  { id: 'twin-rings', name: 'توينزات', icon: 'Layers', description: 'توينزات عرايس وأطقم خواتم مزدوجة فائقة البريق' },
  { id: 'pendants', name: 'تعاليق', icon: 'Award', description: 'تعاليق ودلايات راقية وماشات بتصاميم إسلامية وتراثية وعصرية' },
  { id: 'bracelets', name: 'انسيال', icon: 'Maximize2', description: 'انسيالات ذهب كارتييه وتنس وبارزة بتشطيب ناعم' },
  { id: 'collars', name: 'عقد', icon: 'Crown', description: 'أعقاد شوكر وكوليهات ملكية للمناسبات الخاصة والشبكات' },
  { id: 'necklaces', name: 'سلاسل', icon: 'Gem', description: 'سلاسل ذهب إيطالي وحبل وسنغافوري بأطوال وأوزان مختلفة' },
];

// Initial default settings
const DEFAULT_SETTINGS = {
  storeName: 'SOLIMAN GOLD',
  tagline: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
  whatsappNumber: '201020476773', // Soliman Gold WhatsApp
  phoneNumber: '0473405032',
  address: 'شارع جمال عبدالناصر، قلين المحطة، مركز قلين، كفر الشيخ',
  workHours: 'يوميًا من 11:30 صباحًا حتى 11:00 مساءً',
  currency: 'ج.م',
  heroBannerTitle: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
  heroBannerSubtitle: 'مجموعات استثنائية من الذهب عيار 18 و 21 و 24 المصاغ بأيدي نخبة الصاغة، نجمع بين بريق الذهب الأصفر وسحر التصاميم العصرية لتخليد أروع لحظاتك.',
  heroBannerBadge: 'مجموعة 2026 الحصرية',
  announcementBar: '✨ سليمان جولد SOLIMAN GOLD · تفاصيل صغيرة تصنع فخامة لا تُنسى | اطلب عبر واتساب مباشرة',
  goldPrices: {
    karat24: 4350,
    karat21: 3806,
    karat18: 3262,
    goldPound: 30448, // 8 grams 21k
    lastUpdated: 'اليوم، تحديث فوري لبورصة الصاغة',
  },
  priceDisclaimer: 'ملاحظة: الأسعار المعروضة استرشادية وقد تتغير طفيفاً وفقاً لحركة سعر الذهب الرسمية ومصنعية القطعة لحظة تأكيد الفاتورة.',
  adminPin: '112233', // Default admin PIN for dashboard access
  autoCalcPrices: false, // Whether to recalculate product prices by weight * gramPrice
  hideAllPrices: true, // Default to true to hide prices and rely on WhatsApp inquiries
  logoUrl: '/assets/aistudio/logo_20a2cea5.jpeg',
};

// Initial luxury seed products
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    code: 'BGL-2101',
    name: 'طقم غوايش كليوباترا عيار 21 نقش ليزر فاخر',
    category: 'bangles',
    karat: 21,
    weight: 42.8,
    price: 168500,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isOffer: false,
    description: 'غوايش ذهب عيار 21 صلبة مرصعة بنقش ليزر إيطالي ثلاثي الأبعاد لا يبهت، تصميم كليوباترا الملكي عالي البريق، مريحة في الارتداء ومثالية للادخار والمناسبات الفخمة.',
    images: [
      'https://images.unsplash.com/photo-1611591475870-7613763f9b23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 130,
    order: 1,
    views: 342,
  },
  {
    id: 'prod-002',
    code: 'RNG-1804',
    name: 'خاتم سوليتير ملكي عيار 18 مرصع بأحجار زيركون سويسري',
    category: 'rings',
    karat: 18,
    weight: 5.6,
    price: 24500,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isOffer: true,
    oldPrice: 26800,
    description: 'خاتم سوليتير فاخر من الذهب الأصفر والأبيض عيار 18، بحجر رئيسي بقطع بريليانت نقي محاط بهالة من الأحجار الدقيقة، تشطيب مرآتي بلمعان لا يقاوم.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 220,
    order: 2,
    views: 489,
  },
  {
    id: 'prod-003',
    code: 'SET-2109',
    name: 'طقم شبكة عروس ملكي كامل عيار 21 (كوليه + إسورة + خاتم + حلق)',
    category: 'collars',
    karat: 21,
    weight: 78.5,
    price: 308500,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isOffer: false,
    description: 'طقم شبكة متكامل التصميم مستوحى من التيجان الملكية، عيار 21 صافي بتطعيمات ليزرية مبهرة، يحتوي على عقد شلالي فخم، إسورة عريضة، خاتم بارز، وزوج حلقان مدلدلة متناسقة.',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 125,
    order: 3,
    views: 610,
  },
  {
    id: 'prod-004',
    code: 'NCK-2105',
    name: 'سلسلة شوكر إيطالي عيار 21 انسيابية بريق الألماس',
    category: 'necklaces',
    karat: 21,
    weight: 16.2,
    price: 63500,
    hidePrice: true,
    inStock: true,
    isFeatured: false,
    isNew: true,
    isOffer: false,
    description: 'سلسلة ذهبية عريضة عيار 21 بطول مثالي حول العنق، منسوجة بأسلوب الحراشف الإيطالية المرنة التي تعكس النور مع كل حركة كشلال من الذهب الخالص.',
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 110,
    order: 4,
    views: 215,
  },
  {
    id: 'prod-005',
    code: 'BAR-2401',
    name: 'سبيكة ذهب عيار 24 وزن 31.10 جرام (أونصة) مغلفة بغلاف الأمان',
    category: 'bullion',
    karat: 24,
    weight: 31.1,
    price: 137800,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isOffer: false,
    description: 'أونصة ذهب عيار 24 نقاء 999.9 معتمدة ومختومة رسمياً مع شهادة الفحص وباركود التحقق الدولي، بغلاف مغلق ومؤمن برقم تسلسلي موحد للاستثمار الآمن.',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 65,
    order: 5,
    views: 820,
  },
  {
    id: 'prod-006',
    code: 'BRC-1802',
    name: 'إسورة كارتييه لوف ستايل عيار 18 مع مفك أمان فاخر',
    category: 'bracelets',
    karat: 18,
    weight: 22.4,
    price: 79800,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isOffer: false,
    description: 'إسورة أيقونية ملساء عيار 18 بنقشة البراغي الشهيرة وقفل أمان داخلي محكم، متوفرة بمقاسات مختلفة من الذهب الأصفر والروز جولد، رمز الأناقة العصرية الخالدة.',
    images: [
      'https://images.unsplash.com/photo-1611591475870-7613763f9b23?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 180,
    order: 6,
    views: 412,
  },
  {
    id: 'prod-007',
    code: 'EAR-2103',
    name: 'زوج حلقان هلالي عيار 21 مفرغ بخرزات معلقة ناعمة',
    category: 'earrings',
    karat: 21,
    weight: 8.9,
    price: 35100,
    hidePrice: true,
    inStock: true,
    isFeatured: false,
    isNew: false,
    isOffer: true,
    oldPrice: 37500,
    description: 'حلقان عيار 21 بتصميم تراثي هلالي مطور بحلقات متدلية تحدث صوتاً خافتاً وبريقاً لافتاً، قفل مريح ومناسب للاستخدام اليومي والمناسبات.',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 140,
    order: 7,
    views: 198,
  },
  {
    id: 'prod-008',
    code: 'PND-2102',
    name: 'دلاية آية الكرسي عيار 21 صياغة يدوية مع إطار مزخرف',
    category: 'pendants',
    karat: 21,
    weight: 11.2,
    price: 44200,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isOffer: false,
    description: 'دلاية دائرية بارزة محفور عليها آية الكرسي كاملة بخط النسخ العربي البديع، محاطة بإطار مضفور عيار 21 يبرز دقة الحرفة المصرية الأصيلة.',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 135,
    order: 8,
    views: 310,
  },
  {
    id: 'prod-009',
    code: 'PND-2402',
    name: 'جنيه ذهب جورج بريطاني / مصري ميزان عيار 21 وزن 8 جرام',
    category: 'bullion',
    karat: 21,
    weight: 8.0,
    price: 31200,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: false,
    isOffer: false,
    description: 'جنيه ذهب وزن رسمي 8.0 جرام من الذهب عيار 21، مدموغ رسمياً من مصلحة الدمغة والموازين المصرية، الأداة الكلاسيكية الأكثر أماناً للاحتفاظ بالقيمة.',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 50,
    order: 9,
    views: 740,
  },
  {
    id: 'prod-010',
    code: 'BGL-2104',
    name: 'غوايش عريضة نقش سنبافي عيار 21 تصميم خليجي فاخر',
    category: 'bangles',
    karat: 21,
    weight: 36.5,
    price: 143800,
    hidePrice: true,
    inStock: false, // For testing availability badge (غير متوفر / بالطلب)
    isFeatured: false,
    isNew: false,
    isOffer: false,
    description: 'غويشة فردية عريضة (عرض 2.5 سم) عيار 21 بتفاصيل مخرومة يدويًا ونقشة حبات السنابل التي تعكس الضوء ببراعة فائقة. تصنع خصيصاً بالطلب حسب مقاس المعصم.',
    images: [
      'https://images.unsplash.com/photo-1611591475870-7613763f9b23?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 130,
    order: 10,
    views: 180,
  },
  {
    id: 'prod-011',
    code: 'BND-2101',
    name: 'دبلة زفاف ليزر عيار 21 بتشطيب إيطالي مريح Comfort Fit',
    category: 'wedding-bands',
    karat: 21,
    weight: 4.8,
    price: 19800,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isOffer: false,
    description: 'دبلة خطوبة وزفاف عيار 21 صب بتصميم إيطالي مصقول بحواف ناعمة مريحة جداً للإصبع، لمعان ذهبي كلاسيكي يدوم للأبد مع إمكانية النقش الداخلي المجاني بالليزر.',
    images: [
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 140,
    order: 11,
    views: 295,
  },
  {
    id: 'prod-012',
    code: 'TWN-1801',
    name: 'توينز ألماس ستايل عيار 18 مرصع بأحجار زيركون فاخرة',
    category: 'twin-rings',
    karat: 18,
    weight: 7.2,
    price: 31500,
    hidePrice: true,
    inStock: true,
    isFeatured: true,
    isNew: true,
    isOffer: true,
    oldPrice: 34000,
    description: 'طقم خاتمين توينز عيار 18 متداخلين بتناسق مذهل، أحدهما سوليتير بحجر مركزي براق والآخر محبس مرصع بصفين من الأحجار السويسرية النقية، خيار العروس الأول.',
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    ],
    craftsmanshipFee: 210,
    order: 12,
    views: 420,
  },
];

// Helper to load or initialize store data
function getStoreData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      settings: DEFAULT_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store data, using defaults:', err);
    return {
      settings: DEFAULT_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
    };
  }
}

// Helper to save store data
function saveStoreData(data: any) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // API Routes
  
  // 1. Store settings
  app.get('/api/settings', (req, res) => {
    const data = getStoreData();
    res.json({ success: true, settings: data.settings });
  });

  app.put('/api/settings', (req, res) => {
    const { settings, pin } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'رمز الأمان غير صحيح' });
    }

    data.settings = { ...data.settings, ...settings };
    saveStoreData(data);
    res.json({ success: true, settings: data.settings });
  });

  // 2. Categories
  app.get('/api/categories', (req, res) => {
    const data = getStoreData();
    res.json({ success: true, categories: data.categories });
  });

  // 3. Products: list with filtering, search, and sorting
  app.get('/api/products', (req, res) => {
    const data = getStoreData();
    let products = [...data.products];

    const { category, karat, search, featured, offer, sort, inStock } = req.query;

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (karat && karat !== 'all') {
      const k = parseInt(karat as string, 10);
      if (!isNaN(k)) {
        products = products.filter((p) => p.karat === k);
      }
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.inStock);
    }

    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }

    if (offer === 'true') {
      products = products.filter((p) => p.isOffer);
    }

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'weight_asc') {
      products.sort((a, b) => a.weight - b.weight);
    } else if (sort === 'weight_desc') {
      products.sort((a, b) => b.weight - a.weight);
    } else {
      // Default: order or newest
      products.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    res.json({ success: true, count: products.length, products });
  });

  // 4. Single product by ID or Code
  app.get('/api/products/:id', (req, res) => {
    const data = getStoreData();
    const product = data.products.find(
      (p: any) => p.id === req.params.id || p.code.toLowerCase() === req.params.id.toLowerCase()
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    // Increment view count quietly
    product.views = (product.views || 0) + 1;
    saveStoreData(data);

    // Get related products in same category
    const related = data.products
      .filter((p: any) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    res.json({ success: true, product, related });
  });

  // 5. Admin Auth Check
  app.post('/api/admin/verify', (req, res) => {
    const { pin } = req.body;
    const data = getStoreData();

    if (pin === data.settings.adminPin) {
      return res.json({ success: true, message: 'تم التحقق بنجاح' });
    }
    return res.status(401).json({ success: false, message: 'رمز الدخول غير صحيح' });
  });

  // 6. Create product (Admin)
  app.post('/api/products', (req, res) => {
    const { pin, product } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    if (!product.name || !product.code) {
      return res.status(400).json({ success: false, message: 'اسم المنتج وكوده مطلوبان' });
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      code: product.code.trim().toUpperCase(),
      name: product.name.trim(),
      category: product.category || 'rings',
      karat: Number(product.karat) || 21,
      weight: Number(product.weight) || 0,
      price: Number(product.price) || 0,
      hidePrice: Boolean(product.hidePrice),
      inStock: product.inStock !== false,
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
      isOffer: Boolean(product.isOffer),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      description: product.description || '',
      seoTitle: product.seoTitle ? String(product.seoTitle).trim() : '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
      ],
      craftsmanshipFee: Number(product.craftsmanshipFee) || 0,
      order: data.products.length + 1,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    data.products.unshift(newProduct);
    saveStoreData(data);
    res.json({ success: true, product: newProduct });
  });

  // 7. Update product (Admin)
  app.put('/api/products/:id', (req, res) => {
    const { pin, product } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const index = data.products.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    data.products[index] = {
      ...data.products[index],
      ...product,
      karat: Number(product.karat) || data.products[index].karat,
      weight: Number(product.weight) || data.products[index].weight,
      price: Number(product.price) || data.products[index].price,
      updatedAt: new Date().toISOString(),
    };

    saveStoreData(data);
    res.json({ success: true, product: data.products[index] });
  });

  // 8. Delete product (Admin)
  app.delete('/api/products/:id', (req, res) => {
    const { pin } = req.query;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const initialLen = data.products.length;
    data.products = data.products.filter((p: any) => p.id !== req.params.id);

    if (data.products.length === initialLen) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    saveStoreData(data);
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  });

  // 8.1 Clear all products (Admin)
  app.post('/api/products/clear-all', (req, res) => {
    const { pin } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const previousCount = data.products.length;
    data.products = [];
    saveStoreData(data);

    res.json({
      success: true,
      message: `تم مسح كافة المنتجات بنجاح (${previousCount} منتج). الكتالوج فارغ الآن وجاهز لرفع الأصناف الجديدة.`,
      count: previousCount,
    });
  });

  // 9. Bulk import CSV/Excel/JSON
  app.post('/api/products/bulk', (req, res) => {
    const { pin, items, updateExisting = true } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'قائمة المنتجات فارغة' });
    }

    const categoryDefaultImages: Record<string, string> = {
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

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const code = String(item.code || '').trim().toUpperCase();
      const name = String(item.name || '').trim();
      if (!name || !code) continue;

      const category = item.category || 'rings';
      const defaultImg = categoryDefaultImages[category] || categoryDefaultImages.rings;
      const images = Array.isArray(item.images) && item.images.length > 0 
        ? item.images 
        : (item.imageUrl ? [item.imageUrl] : [defaultImg]);

      // Check if product with same code already exists
      const existingIndex = data.products.findIndex(
        (p: any) => p.code && p.code.trim().toUpperCase() === code
      );

      if (existingIndex !== -1 && updateExisting) {
        // Update existing item
        data.products[existingIndex] = {
          ...data.products[existingIndex],
          name: name,
          category: category,
          karat: Number(item.karat) || data.products[existingIndex].karat || 21,
          weight: Number(item.weight) || data.products[existingIndex].weight || 0,
          price: Number(item.price) || data.products[existingIndex].price || 0,
          description: item.description ? String(item.description).trim() : data.products[existingIndex].description,
          seoTitle: item.seoTitle ? String(item.seoTitle).trim() : (data.products[existingIndex].seoTitle || `${name} | عيار ${item.karat || 21} | سليمان جولد`),
          hidePrice: item.hidePrice !== undefined ? Boolean(item.hidePrice) : data.products[existingIndex].hidePrice,
          inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
          updatedAt: new Date().toISOString(),
        };
        updatedCount++;
      } else if (existingIndex === -1) {
        // Create new item
        const newProduct = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          code: code,
          name: name,
          category: category,
          karat: Number(item.karat) || 21,
          weight: Number(item.weight) || 0,
          price: Number(item.price) || 0,
          hidePrice: Boolean(data.settings.hideAllPrices),
          inStock: true,
          isFeatured: false,
          isNew: true,
          isOffer: false,
          description: item.description ? String(item.description).trim() : `صياغة ذهبية فاخرة عيار ${item.karat || 21} وزن ${item.weight || 0} جم من تشكيلات سليمان جولد SOLIMAN GOLD.`,
          seoTitle: item.seoTitle ? String(item.seoTitle).trim() : `${name} | عيار ${item.karat || 21} | سليمان جولد`,
          images: images,
          craftsmanshipFee: Number(item.craftsmanshipFee) || 0,
          order: data.products.length + 1,
          views: 0,
          createdAt: new Date().toISOString(),
        };
        data.products.unshift(newProduct);
        addedCount++;
      }
    }

    saveStoreData(data);
    res.json({
      success: true,
      count: addedCount + updatedCount,
      addedCount,
      updatedCount,
      message: `تمت المعالجة بنجاح: إضافة ${addedCount} منتج جديد، وتحديث ${updatedCount} منتج حالي.`,
    });
  });

  // 10. Single image upload from computer (base64)
  app.post('/api/upload', (req, res) => {
    const { pin, image, filename, productCode } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    if (!image) {
      return res.status(400).json({ success: false, message: 'لم يتم إرسال بيانات الصورة' });
    }

    try {
      let ext = 'jpg';
      let base64Data = image;

      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        base64Data = matches[2];
      }

      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext.toLowerCase()) ? ext.toLowerCase() : 'jpg';
      const cleanName = filename
        ? String(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\.[^.]+$/, '')
        : `gold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const targetFilename = `${cleanName}_${Date.now()}.${safeExt}`;
      const targetPath = path.join(UPLOADS_DIR, targetFilename);

      fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
      const fileUrl = `/uploads/${targetFilename}`;

      // If productCode is provided, optionally bind image to the product
      if (productCode) {
        const prodIndex = data.products.findIndex(
          (p: any) => p.code && p.code.toLowerCase() === String(productCode).toLowerCase()
        );
        if (prodIndex !== -1) {
          if (!Array.isArray(data.products[prodIndex].images)) {
            data.products[prodIndex].images = [];
          }
          data.products[prodIndex].images.unshift(fileUrl);
          saveStoreData(data);
        }
      }

      res.json({ success: true, url: fileUrl, filename: targetFilename });
    } catch (err: any) {
      console.error('Error saving image:', err);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الصورة على الخادم' });
    }
  });

  // 11. Batch images upload from computer
  app.post('/api/upload/batch', (req, res) => {
    const { pin, items } = req.body;
    const data = getStoreData();

    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'قائمة الصور فارغة' });
    }

    const uploadedResults: { url: string; filename: string; productCode?: string }[] = [];

    for (const item of items) {
      if (!item.image) continue;
      try {
        let ext = 'jpg';
        let base64Data = item.image;

        const matches = item.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          base64Data = matches[2];
        }

        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext.toLowerCase()) ? ext.toLowerCase() : 'jpg';
        const cleanName = item.filename
          ? String(item.filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\.[^.]+$/, '')
          : `gold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        const targetFilename = `${cleanName}_${Date.now()}.${safeExt}`;
        const targetPath = path.join(UPLOADS_DIR, targetFilename);

        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
        const fileUrl = `/uploads/${targetFilename}`;

        // Match product by code if specified, or if filename contains product code
        let matchedCode = item.productCode;
        if (!matchedCode && item.filename) {
          const fn = String(item.filename).toUpperCase();
          const match = data.products.find((p: any) => p.code && fn.includes(p.code.toUpperCase()));
          if (match) matchedCode = match.code;
        }

        if (matchedCode) {
          const prodIndex = data.products.findIndex(
            (p: any) => p.code && p.code.toLowerCase() === String(matchedCode).toLowerCase()
          );
          if (prodIndex !== -1) {
            if (!Array.isArray(data.products[prodIndex].images)) {
              data.products[prodIndex].images = [];
            }
            // Add as primary cover image
            data.products[prodIndex].images.unshift(fileUrl);
          }
        }

        uploadedResults.push({ url: fileUrl, filename: targetFilename, productCode: matchedCode });
      } catch (e) {
        console.error('Error saving batch item:', e);
      }
    }

    saveStoreData(data);
    res.json({
      success: true,
      count: uploadedResults.length,
      items: uploadedResults,
      message: `تم رفع ${uploadedResults.length} صورة من جهازك بنجاح وحفظها بالمعرض.`,
    });
  });

  // 12. List uploaded media files
  app.get('/api/media', (req, res) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        return res.json({ success: true, files: [] });
      }
      const files = fs.readdirSync(UPLOADS_DIR)
        .filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f))
        .map((f) => {
          const stats = fs.statSync(path.join(UPLOADS_DIR, f));
          return {
            filename: f,
            url: `/uploads/${f}`,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.json({ success: true, files });
    } catch (e: any) {
      res.status(500).json({ success: false, message: 'فشل قراءة مكتبة الصور' });
    }
  });

  // 13. Reset to defaults (Admin recovery helper)
  app.post('/api/admin/reset-defaults', (req, res) => {
    const { pin } = req.body;
    const data = getStoreData();
    if (pin !== data.settings.adminPin) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }
    const freshData = {
      settings: DEFAULT_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
    };
    saveStoreData(freshData);
    res.json({ success: true, message: 'تمت استعادة البيانات الافتراضية بنجاح' });
  });

  // Setup Vite in development or serve static in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luxury Jewelry Store server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
