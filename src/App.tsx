import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Crown,
  Tag,
  ArrowUpDown,
  CheckCircle2,
  Shield,
  Award,
  Sparkles,
  ArrowLeft,
  Gem,
  Check
} from 'lucide-react';
import { Product, CartItem } from './types/jewelry';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoriesBar } from './components/CategoriesBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppCartDrawer } from './components/WhatsAppCartDrawer';
import { GoldRatesModal } from './components/GoldRatesModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { useFirebase } from './context/FirebaseContext';

export default function App() {
  // Real-time Firebase Firestore Data State
  const { settings, categories, products, loading } = useFirebase();

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('soliman_jewelry_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKarat, setSelectedKarat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('default');

  // Theme Mode State ('light' | 'dark' stored in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('soliman_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('soliman_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme preference', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGoldRatesOpen, setIsGoldRatesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('soliman_jewelry_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Check URL query parameters for shareable product links or direct admin access
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const productCode = params.get('product');
    if (productCode && !selectedProduct) {
      const match = products.find(
        (p: Product) => p.code.toLowerCase() === productCode.toLowerCase()
      );
      if (match) {
        setSelectedProduct(match);
        document.title = match.seoTitle || `${match.name} | عيار ${match.karat} | سليمان جولد`;
      }
    }
  }, [products]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Navigation helpers
  const handleNavigateToCatalog = (category?: string) => {
    if (category === 'latest') {
      setSelectedCategory('all');
      setSelectedKarat('all');
      setSortOption('default');
    } else if (category === 'offers') {
      setSelectedCategory('all');
      setSelectedKarat('all');
      setOnlyOffers(true);
    } else if (category) {
      setSelectedCategory(category);
      setOnlyOffers(false);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered and Sorted Products for Catalog
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Karat filter (18, 21, 24)
    if (selectedKarat && selectedKarat !== 'all') {
      const k = parseInt(selectedKarat, 10);
      result = result.filter((p) => p.karat === k);
    }

    // Stock availability filter
    if (onlyInStock) {
      result = result.filter((p) => p.inStock);
    }

    // Offers filter
    if (onlyOffers) {
      result = result.filter((p) => p.isOffer);
    }

    // Search query filter (name or code)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'weight_asc') {
      result.sort((a, b) => a.weight - b.weight);
    } else if (sortOption === 'weight_desc') {
      result.sort((a, b) => b.weight - a.weight);
    } else {
      // Default: order or newest
      result.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return result;
  }, [products, selectedCategory, selectedKarat, onlyInStock, onlyOffers, searchQuery, sortOption]);

  // Featured products for Dark Homepage section
  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 4),
    [products]
  );

  // Special offers for Offers section
  const offerProducts = useMemo(
    () => products.filter((p) => p.isOffer).slice(0, 4),
    [products]
  );

  // Related products for Details Modal
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .slice(0, 4);
  }, [products, selectedProduct]);

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] dark:bg-[#111111] flex flex-col items-center justify-center text-[#8A6A2E] dark:text-[#C6A667] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#C6A667]/30 border-t-[#9E7F43] dark:border-t-[#C6A667] animate-spin" />
        <span className="text-sm font-['Cinzel',serif] tracking-[0.2em] uppercase">
          SOLIMAN GOLD · جاري التحميل...
        </span>
      </div>
    );
  }

  const currentSettings = settings || {
    storeName: 'SOLIMAN GOLD',
    tagline: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
    whatsappNumber: '201020476773',
    phoneNumber: '0473405032',
    address: 'شارع جمال عبدالناصر، قلين المحطة، مركز قلين، كفر الشيخ',
    workHours: 'يوميًا من 10:30 ص حتى 11:00 م',
    currency: 'ج.م',
    heroBannerTitle: 'تفاصيل صغيرة… تصنع فخامة لا تُنسى',
    heroBannerSubtitle: 'مجموعات استثنائية من الذهب عيار 18 و 21 و 24 المصاغ بأيدي نخبة الصاغة، نجمع بين بريق الذهب الأصفر وسحر التصاميم العصرية لتخليد أروع لحظاتك.',
    heroBannerBadge: 'المجموعة الحصرية 2026',
    announcementBar: '✨ سليمان جولد SOLIMAN GOLD · تفاصيل صغيرة تصنع فخامة لا تُنسى | اطلب عبر واتساب مباشرة',
    goldPrices: {
      karat24: 4350,
      karat21: 3806,
      karat18: 3262,
      goldPound: 30448,
      lastUpdated: 'اليوم',
    },
    priceDisclaimer: 'الأسعار قابلة للتغيير وفق سعر الذهب وقت تأكيد الطلب.',
    adminPin: '112233',
    hideAllPrices: true,
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] dark:bg-[#111111] text-[#1A1A1A] dark:text-[#FAF8F3] flex flex-col font-['Cairo',sans-serif] transition-colors duration-200">
      
      {/* 1. Header & Navigation */}
      <Navbar
        settings={currentSettings}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateToCatalog={handleNavigateToCatalog}
        onOpenGoldRates={() => setIsGoldRatesOpen(true)}
      />

      <main className="flex-1">
        
        {/* ======================================================== */}
        {/* SECTION 1: HOMEPAGE — LIGHT LUXURY (#FAF8F3)             */}
        {/* ======================================================== */}
        
        {/* Hero Banner */}
        <HeroBanner
          settings={currentSettings}
          onExploreCatalog={() => handleNavigateToCatalog('all')}
          onExploreOffers={() => handleNavigateToCatalog('offers')}
          onOpenGoldRates={() => setIsGoldRatesOpen(true)}
        />

        {/* Categories Bar */}
        <CategoriesBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setOnlyOffers(false);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Featured Product Collections */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <section className="py-14 bg-white dark:bg-[#141414] border-b border-[#E8DEC9] dark:border-stone-800/80 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 text-right">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#9E7F43] dark:text-[#C6A667]" />
                    <span className="text-xs font-bold text-[#9E7F43] dark:text-[#C6A667] uppercase tracking-widest font-['Cinzel',serif]">
                      ROYAL SELECTION 2026
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-[#FAF8F3] font-serif">
                    انتقاءات سليمان جولد المميزة
                  </h2>
                </div>

                <button
                  onClick={() => handleNavigateToCatalog('all')}
                  className="text-xs font-bold text-[#8A6A2E] dark:text-[#C6A667] hover:text-[#111111] dark:hover:text-[#E2CCA1] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>عرض الكتالوج الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Columns Desktop, 2 on Mobile */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={currentSettings}
                    variant={theme}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: PRODUCT CATALOG — DUAL LUXURY IVORY / OBSIDIAN */}
        {/* ======================================================== */}
        
        <section id="catalog-section" className="py-16 bg-[#FAF8F3] dark:bg-[#111111] text-[#1A1A1A] dark:text-[#FAF8F3] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 pb-6 border-b border-[#E8DEC9] dark:border-stone-800 text-right">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-[1.5px] bg-[#C6A667]" />
                  <span className="text-xs font-bold text-[#9E7F43] dark:text-[#C6A667] uppercase tracking-widest font-['Cinzel',serif]">
                    SOLIMAN DIGITAL SHOWROOM
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111111] dark:text-[#FAF8F3] font-serif">
                  كتالوج المجوهرات والذهب
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl font-light">
                  تصفح أرقى تشكيلات الذهب الخالص عيار 18 و 21 و 24 بالصور والأسعار المحدثة، واطلب فوراً عبر واتساب
                </p>
              </div>

              {/* Search Bar by Name or Code */}
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو كود القطعة..."
                  className="w-full bg-white dark:bg-[#181920] border border-[#E0D6C3] dark:border-stone-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#111111] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-[#C6A667] focus:ring-1 focus:ring-[#C6A667] outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Quick Category Navigation Chips (10 Categories) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-[#C6A667] text-[#111111] border-[#C6A667] shadow-sm font-bold'
                    : 'bg-white dark:bg-[#181920] text-stone-700 dark:text-stone-300 border-[#E8DEC9] dark:border-stone-800 hover:border-[#C6A667] dark:hover:border-[#C6A667]'
                }`}
              >
                الكل ({products.length})
              </button>
              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = products.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#C6A667] text-[#111111] border-[#C6A667] font-bold shadow-sm'
                          : 'bg-white dark:bg-[#181920] text-stone-700 dark:text-stone-300 border-[#E8DEC9] dark:border-stone-800 hover:border-[#C6A667] dark:hover:border-[#C6A667] hover:bg-[#FAF8F3] dark:hover:bg-[#1F212B]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                            isSelected
                              ? 'bg-[#111111]/15 text-[#111111]'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#181920] border border-[#E8DEC9] dark:border-stone-800 text-xs shadow-sm transition-colors">
              
              {/* Category & Karat Filters */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Karat selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">العيار:</span>
                  <div className="flex items-center gap-1 bg-[#FAF8F3] dark:bg-[#121319] p-1 rounded-lg border border-[#E8DEC9] dark:border-stone-800">
                    <button
                      onClick={() => setSelectedKarat('all')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        selectedKarat === 'all'
                          ? 'bg-[#C6A667] text-[#111111] font-bold shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      onClick={() => setSelectedKarat('24')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                        selectedKarat === '24'
                          ? 'bg-[#C6A667] text-[#111111] font-bold shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      24k
                    </button>
                    <button
                      onClick={() => setSelectedKarat('21')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                        selectedKarat === '21'
                          ? 'bg-[#C6A667] text-[#111111] font-bold shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      21k
                    </button>
                    <button
                      onClick={() => setSelectedKarat('18')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                        selectedKarat === '18'
                          ? 'bg-[#C6A667] text-[#111111] font-bold shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      18k
                    </button>
                  </div>
                </div>

                {/* Stock Toggle */}
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    onlyInStock
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-[#E8DEC9] dark:border-stone-800 bg-[#FAF8F3] dark:bg-[#121319] text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>المتوفر بالمحل</span>
                </button>

                {/* Offers Toggle */}
                <button
                  onClick={() => setOnlyOffers(!onlyOffers)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    onlyOffers
                      ? 'border-[#C6A667] bg-amber-50 dark:bg-amber-950/40 text-[#9E7F43] dark:text-[#E2CCA1] font-bold'
                      : 'border-[#E8DEC9] dark:border-stone-800 bg-[#FAF8F3] dark:bg-[#121319] text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>العروض الخاصة</span>
                </button>
              </div>

              {/* Sorting Select */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                <span className="text-stone-500 dark:text-stone-400">الترتيب:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-[#FAF8F3] dark:bg-[#121319] border border-[#E8DEC9] dark:border-stone-700 rounded-lg py-1.5 px-3 text-xs text-[#111111] dark:text-[#FAF8F3] focus:border-[#C6A667] outline-none cursor-pointer"
                >
                  <option value="default">الترتيب الافتراضي (الأحدث)</option>
                  {!currentSettings.hideAllPrices && (
                    <>
                      <option value="price_asc">السعر: من الأقل للأعلى</option>
                      <option value="price_desc">السعر: من الأعلى للأقل</option>
                    </>
                  )}
                  <option value="weight_desc">الوزن: من الأثقل للأخف</option>
                  <option value="weight_asc">الوزن: من الأخف للأثقل</option>
                </select>
              </div>

            </div>

            {/* Results Count & Active Filters Indicator */}
            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <div>
                عرض <strong className="text-[#111111] dark:text-[#FAF8F3] font-mono font-bold">{filteredProducts.length}</strong> قطعة مجوهرات
                {selectedCategory !== 'all' && (
                  <span>
                    {' '}في تصنيف: <strong className="text-[#9E7F43] dark:text-[#C6A667]">{categories.find((c) => c.id === selectedCategory)?.name}</strong>
                  </span>
                )}
              </div>

              {(selectedCategory !== 'all' || selectedKarat !== 'all' || onlyInStock || onlyOffers || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedKarat('all');
                    setOnlyInStock(false);
                    setOnlyOffers(false);
                    setSearchQuery('');
                  }}
                  className="text-[#9E7F43] dark:text-[#C6A667] hover:underline cursor-pointer font-medium"
                >
                  إعادة ضبط جميع الفلاتر
                </button>
              )}
            </div>

            {/* 4-Columns Desktop / 2-Columns Mobile Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-16 rounded-2xl bg-white dark:bg-[#181920] border border-[#E8DEC9] dark:border-stone-800 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F3] dark:bg-[#121319] border border-[#E8DEC9] dark:border-stone-800 flex items-center justify-center mx-auto text-stone-400">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111] dark:text-[#FAF8F3]">لم نجد قطع مجوهرات تطابق بحثك</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر لاستعراض الكتالوج بالكامل
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedKarat('all');
                    setOnlyInStock(false);
                    setOnlyOffers(false);
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#C6A667] text-[#111111] text-xs font-bold hover:bg-[#E2CCA1] transition-colors cursor-pointer shadow-sm"
                >
                  عرض جميع القطع
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={currentSettings}
                    variant={theme}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: HERITAGE & CRAFTSMANSHIP                      */}
        {/* ======================================================== */}
        
        <section className="py-16 bg-[#F4EFE6] dark:bg-[#14151B] text-[#1A1A1A] dark:text-[#FAF8F3] border-t border-b border-[#E8DEC9] dark:border-stone-800 relative overflow-hidden transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-4 text-right">
                <span className="text-xs font-bold text-[#8A6A2E] dark:text-[#C6A667] uppercase tracking-widest font-['Cinzel',serif]">
                  SOLIMAN GOLD HERITAGE
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#111111] dark:text-[#FAF8F3]">
                  حرفية الصاغة وسحر الذهب الخالص
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                  في سليمان جولد، نؤمن بأن كل قطعة ذهب ليست مجرد زينة، بل استثمار في الجمال واللحظات الخالدة. كل تصميم يتم تشكيله بإتقان يدوي ولمسات ليزر دقيقة، مع خضوعه التام لمعايير مصلحة الدمغة والموازين المصرية.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                    <span className="block font-bold text-[#8A6A2E] dark:text-[#C6A667] mb-1">عيار 21 الملكي</span>
                    <span className="text-stone-600 dark:text-stone-400">الأكثر نقاءً وصلابة في المشغولات اليومية</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm">
                    <span className="block font-bold text-[#8A6A2E] dark:text-[#C6A667] mb-1">عيار 18 الإيطالي</span>
                    <span className="text-stone-600 dark:text-stone-400">أعلى درجات البريق والتطعيم الحجري</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B1D25] border border-[#E8DEC9] dark:border-stone-800 shadow-sm col-span-2 sm:col-span-1">
                    <span className="block font-bold text-[#8A6A2E] dark:text-[#C6A667] mb-1">سبائك عيار 24</span>
                    <span className="text-stone-600 dark:text-stone-400">نقاء 999.9 للاستثمار والادخار الآمن</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1D25] border border-[#C6A667]/40 max-w-sm text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F3] dark:bg-[#121319] border border-[#C6A667]/50 flex items-center justify-center mx-auto text-[#8A6A2E] dark:text-[#C6A667]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#111111] dark:text-[#FAF8F3] font-serif">
                    ضمان الفاتورة المعتمدة
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                    تحصل مع كل قطعة على فاتورة رسمية مفصلة بالوزن، العيار، والسعر، تضمن لك حق إعادة البيع أو الاستبدال في أي وقت بأفضل سعر.
                  </p>
                  <button
                    onClick={() => handleNavigateToCatalog('all')}
                    className="w-full py-2.5 rounded-lg bg-[#C6A667] hover:bg-[#B89347] text-[#111111] font-bold text-xs transition-colors cursor-pointer"
                  >
                    استكشف التشكيلة الآن
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: SPECIAL OFFERS                                */}
        {/* ======================================================== */}
        
        {offerProducts.length > 0 && (
          <section className="py-14 bg-[#FAF8F3] dark:bg-[#111111] border-b border-[#E8DEC9] dark:border-stone-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 text-right">
                <div>
                  <span className="text-xs font-semibold text-[#9E7F43] dark:text-[#C6A667] uppercase tracking-widest block mb-1 font-['Cinzel',serif]">
                    SPECIAL OFFERS & PROMOTIONS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-[#FAF8F3] font-serif">
                    عروض وخصومات سليمان جولد
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light">
                  مصنعيات خاصة وأسعار استثنائية على تشكيلات مختارة لفترة محدودة
                </p>
              </div>

              {/* 4 Columns Desktop / 2 Columns Mobile */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={currentSettings}
                    variant={theme}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* 5. Product Detail Modal (Warm Ivory Editorial Layout) */}
      <ProductDetailModal
        product={selectedProduct}
        settings={currentSettings}
        relatedProducts={relatedProducts}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      {/* 6. WhatsApp Inquiry & Shopping Cart Drawer */}
      <WhatsAppCartDrawer
        isOpen={isCartOpen}
        cart={cart}
        settings={currentSettings}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* 7. Live Gold Rates & Calculator Modal */}
      <GoldRatesModal
        isOpen={isGoldRatesOpen}
        settings={currentSettings}
        onClose={() => setIsGoldRatesOpen(false)}
      />

      {/* 8. Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        settings={currentSettings}
        categories={categories}
        products={products}
        theme={theme}
        onToggleTheme={toggleTheme}
        onClose={() => setIsAdminOpen(false)}
        onRefreshData={() => {}}
      />

      {/* 9. Floating WhatsApp Quick Contact Button */}
      <FloatingWhatsApp settings={currentSettings} />

      {/* 10. Footer */}
      <Footer
        settings={currentSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateToCatalog={handleNavigateToCatalog}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGoldRates={() => setIsGoldRatesOpen(true)}
      />

    </div>
  );
}
