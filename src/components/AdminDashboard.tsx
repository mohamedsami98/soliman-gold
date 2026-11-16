import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  TrendingUp,
  Settings as SettingsIcon,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  Layers,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Download,
  AlertTriangle,
  FileUp,
  FileText,
  RefreshCw,
  Search,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Upload,
  HardDrive,
  Camera,
  Grid,
  List,
  LogOut,
  Database,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../context/FirebaseContext';
import {
  createProductInFirestore,
  updateProductInFirestore,
  deleteProductInFirestore,
  clearAllProductsInFirestore,
  bulkUpsertProductsInFirestore,
  saveStoreSettingsInFirestore,
  saveAdminPinInFirestore,
  saveMediaItemInFirestore,
} from '../services/firestoreStore';
import { Product, StoreSettings, Category } from '../types/jewelry';
import { formatCurrency } from '../utils/whatsapp';
import {
  parseExcelData,
  downloadSampleExcelTemplate,
  ParsedJewelryItem
} from '../utils/excelImport';

interface AdminDashboardProps {
  isOpen: boolean;
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  settings,
  categories,
  products,
  onClose,
  onRefreshData,
}) => {
  const {
    user,
    isAdmin,
    firestoreSynced,
    adminPinFromDb,
    mediaRecords,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    refreshCurrentUser,
    logoutFirebase,
    syncLocalDataToFirebase,
  } = useFirebase();

  // Authentication State (Hooks must run unconditionally)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isEmailSignUp, setIsEmailSignUp] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfoMessage, setAuthInfoMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'gold' | 'bulk' | 'media'>('products');

  // Product Form State (for adding / editing)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('bangles');
  const [formKarat, setFormKarat] = useState<number>(21);
  const [formWeight, setFormWeight] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formHidePrice, setFormHidePrice] = useState(false);
  const [formInStock, setFormInStock] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsOffer, setFormIsOffer] = useState(false);
  const [formOldPrice, setFormOldPrice] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formImagesText, setFormImagesText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Store Settings Form State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);

  // Bulk / Excel Import State
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportStatus, setBulkImportStatus] = useState('');
  const [parsedExcelItems, setParsedExcelItems] = useState<ParsedJewelryItem[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelFileError, setExcelFileError] = useState('');
  const [isReadingExcel, setIsReadingExcel] = useState(false);
  const [isSubmittingExcel, setIsSubmittingExcel] = useState(false);
  const [updateExistingByCode, setUpdateExistingByCode] = useState(true);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'new' | 'existing'>('all');

  // Products listing view & direct image upload
  const [productsViewMode, setProductsViewMode] = useState<'table' | 'photoGrid'>('table');
  const [productPhotoFilter, setProductPhotoFilter] = useState<'all' | 'needsPhoto' | 'hasPhoto'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [showClearAllConfirmModal, setShowClearAllConfirmModal] = useState(false);
  const [isClearingAllProducts, setIsClearingAllProducts] = useState(false);

  // Automatic Gold Formulas Toggle (default true)
  const [autoCalcFrom21, setAutoCalcFrom21] = useState(true);

  // Media Library state
  interface MediaFileItem {
    filename: string;
    url: string;
    size: number;
    createdAt: string;
  }
  const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const combinedMediaFiles = useMemo(() => {
    const byUrl = new Map<string, MediaFileItem>();
    for (const rec of mediaRecords) {
      if (rec.url && !byUrl.has(rec.url)) {
        byUrl.set(rec.url, {
          filename: rec.filename || rec.url.split('/').pop() || 'image.jpg',
          url: rec.url,
          size: Number(rec.size || 0),
          createdAt: typeof rec.createdAt === 'string' ? rec.createdAt : '',
        });
      }
    }
    for (const f of mediaFiles) {
      if (f.url && !byUrl.has(f.url)) {
        byUrl.set(f.url, f);
      }
    }
    return Array.from(byUrl.values());
  }, [mediaRecords, mediaFiles]);

  // Form image upload state
  const [isUploadingFormImages, setIsUploadingFormImages] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // Batch Media Upload state
  interface BatchMediaItem {
    id: string;
    file: File;
    name: string;
    size: number;
    previewUrl: string;
    matchedProductCode: string;
  }
  const [batchFiles, setBatchFiles] = useState<BatchMediaItem[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [batchUploadResult, setBatchUploadResult] = useState('');

  // Helper to read file as base64 data url
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Fetch media library files
  const fetchMediaFiles = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setMediaFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to load media files', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'media' && isAuthenticated) {
      fetchMediaFiles();
    }
  }, [activeTab, isAuthenticated]);

  const currentImagesList = formImagesText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const uploadFormImages = async (fileList: File[]) => {
    setIsUploadingFormImages(true);
    setStatusMessage('جارٍ رفع الصور من جهازك وتسجيلها في المتجر...');
    const uploadPin = enteredPin || adminPinFromDb || '112233';
    try {
      const newUrls: string[] = [];
      for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await readFileAsDataUrl(file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: uploadPin,
            image: dataUrl,
            filename: file.name,
            productCode: formCode,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
          await saveMediaItemInFirestore({
            filename: data.filename || file.name,
            url: data.url,
            size: file.size,
            productCode: formCode || undefined,
          }).catch(() => null);
        }
      }
      if (newUrls.length > 0) {
        const updated = [...currentImagesList, ...newUrls];
        setFormImagesText(updated.join('\n'));
        setStatusMessage(`تم رفع ${newUrls.length} صورة من جهاز الكمبيوتر بنجاح!`);
        setTimeout(() => setStatusMessage(''), 3500);
      } else {
        setStatusMessage('لم يتم رفع أي صورة. تأكد من صلاحية الملفات.');
      }
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploadingFormImages(false);
    }
  };

  const handleSetCoverImage = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const list = [...currentImagesList];
    const [item] = list.splice(indexToCover, 1);
    list.unshift(item);
    setFormImagesText(list.join('\n'));
  };

  const handleRemoveFormImage = (indexToRemove: number) => {
    const list = [...currentImagesList];
    list.splice(indexToRemove, 1);
    setFormImagesText(list.join('\n'));
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const processSelectedBatchFiles = (fileList: File[]) => {
    const newItems: BatchMediaItem[] = fileList
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const fn = f.name.toUpperCase();
        let matched = '';
        const match = products.find((p) => p.code && fn.includes(p.code.toUpperCase()));
        if (match) {
          matched = match.code;
        }
        return {
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          previewUrl: URL.createObjectURL(f),
          matchedProductCode: matched,
        };
      });

    setBatchFiles((prev) => [...prev, ...newItems]);
  };

  const handleExecuteBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    setIsUploadingBatch(true);
    setBatchUploadResult('جارٍ قراءة ورفع الصور من جهازك وحفظ روابطها في Firebase...');
    const uploadPin = enteredPin || adminPinFromDb || '112233';

    try {
      const itemsPayload = [];
      for (const item of batchFiles) {
        const dataUrl = await readFileAsDataUrl(item.file);
        itemsPayload.push({
          image: dataUrl,
          filename: item.name,
          size: item.size,
          productCode: item.matchedProductCode || undefined,
        });
      }

      const res = await fetch('/api/upload/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: uploadPin,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const productUpdates = new Map<string, string[]>();

        for (let idx = 0; idx < data.items.length; idx++) {
          const uploaded = data.items[idx] as { url: string; filename: string; productCode?: string };
          const original = batchFiles[idx];
          await saveMediaItemInFirestore({
            filename: uploaded.filename || original?.name || 'image.jpg',
            url: uploaded.url,
            size: original?.size || 0,
            productCode: uploaded.productCode || original?.matchedProductCode || undefined,
          }).catch(() => null);

          const codeToMatch = (uploaded.productCode || original?.matchedProductCode || '').trim().toUpperCase();
          if (codeToMatch) {
            const list = productUpdates.get(codeToMatch) || [];
            list.push(uploaded.url);
            productUpdates.set(codeToMatch, list);
          }
        }

        for (const [code, newUrls] of productUpdates.entries()) {
          const targetProduct = products.find((p) => p.code && p.code.trim().toUpperCase() === code);
          if (targetProduct) {
            const mergedImages = [
              ...newUrls,
              ...(targetProduct.images || []).filter((img) => !newUrls.includes(img)),
            ];
            await updateProductInFirestore(targetProduct.id, {
              ...targetProduct,
              images: mergedImages,
            });
          }
        }

        setBatchUploadResult(`تم رفع ${data.count} صورة بنجاح وحفظها في Firebase!`);
        setBatchFiles([]);
        fetchMediaFiles();
        onRefreshData?.();
      } else {
        setBatchUploadResult(`خطأ: ${data.message}`);
      }
    } catch (err) {
      setBatchUploadResult('حدث خطأ أثناء رفع الصور الجماعية');
    } finally {
      setIsUploadingBatch(false);
    }
  };

  const handleAssignMediaToProduct = async (imageUrl: string, productCode: string) => {
    if (!productCode) return;
    const targetProduct = products.find((p) => p.code === productCode);
    if (!targetProduct) return;

    try {
      setStatusMessage(`جارٍ تعيين الصورة للقطعة (${targetProduct.name}) في Firebase...`);
      const updatedImages = [imageUrl, ...(targetProduct.images || []).filter((img) => img !== imageUrl)];
      await updateProductInFirestore(targetProduct.id, {
        ...targetProduct,
        images: updatedImages,
      });
      setStatusMessage(`تم تعيين الصورة كغلاف للقطعة (${targetProduct.name}) بنجاح!`);
      onRefreshData?.();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء ربط الصورة بالمنتج');
    }
  };

  const handleDirectProductImageUpload = async (product: Product, file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingProductId(product.id);
    setStatusMessage(`جارٍ رفع صورة (${product.name}) من جهاز الكمبيوتر وحفظها في Firebase...`);
    const uploadPin = enteredPin || adminPinFromDb || '112233';

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: uploadPin,
          image: dataUrl,
          filename: `${product.code}_${file.name}`,
          productCode: product.code,
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        const updatedImages = [data.url, ...(product.images || []).filter((img) => img !== data.url)];
        await updateProductInFirestore(product.id, {
          ...product,
          images: updatedImages,
        });
        await saveMediaItemInFirestore({
          filename: data.filename || `${product.code}_${file.name}`,
          url: data.url,
          size: file.size,
          productCode: product.code,
        }).catch(() => null);

        setStatusMessage(`تم بنجاح رفع وتعيين صورة جديدة لـ "${product.name}" في Firebase!`);
        onRefreshData?.();
        setTimeout(() => setStatusMessage(''), 3500);
      } else {
        setStatusMessage(`خطأ: ${data.message || 'فشل رفع الصورة'}`);
      }
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleClearAllProducts = async () => {
    setIsClearingAllProducts(true);
    setStatusMessage('جارٍ مسح كافة المنتجات من Firebase Firestore...');
    try {
      const deletedCount = await clearAllProductsInFirestore();
      setStatusMessage(`تم مسح كافة المنتجات بنجاح (${deletedCount} منتج) من قاعدة البيانات.`);
      setShowClearAllConfirmModal(false);
      onRefreshData?.();
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء مسح المنتجات من Firebase');
    } finally {
      setIsClearingAllProducts(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleRestoreDefaultProducts = async () => {
    if (!confirm('هل تريد استعادة المنتجات التجريبية الافتراضية للمتجر؟')) return;
    setStatusMessage('جارٍ استعادة البيانات الافتراضية إلى Firebase...');
    try {
      const { seededProducts } = await syncLocalDataToFirebase(true);
      setStatusMessage(`تمت استعادة ${seededProducts} منتج افتراضي إلى Firebase بنجاح!`);
      onRefreshData?.();
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء الاستعادة');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  useEffect(() => {
    setTempSettings({
      ...settings,
      adminPin: adminPinFromDb || settings.adminPin || '112233',
    });
  }, [settings, adminPinFromDb]);

  // Handle Karat 21 Gold formula change
  const handleKarat21Change = (new21: number) => {
    if (autoCalcFrom21 && new21 > 0) {
      const k24 = Math.round((new21 * 24) / 21); // (21k * 8) / 7
      const k18 = Math.round((new21 * 18) / 21); // (21k * 6) / 7
      const pound = Math.round(new21 * 8); // 8 grams of 21k
      setTempSettings((prev) => ({
        ...prev,
        goldPrices: {
          ...prev.goldPrices,
          karat21: new21,
          karat24: k24,
          karat18: k18,
          goldPound: pound,
          lastUpdated: 'تحديث فوري لبورصة الصاغة',
        },
      }));
    } else {
      setTempSettings((prev) => ({
        ...prev,
        goldPrices: {
          ...prev.goldPrices,
          karat21: new21,
        },
      }));
    }
  };

  // Safe early exit AFTER all hooks have executed
  if (!isOpen) return null;

  const verifyAuthorizedAdminUser = async (currentUser: NonNullable<typeof user>): Promise<boolean> => {
    const isBootstrappedAdmin =
      currentUser.email?.toLowerCase() === 'sandidodo80@gmail.com' &&
      currentUser.emailVerified;

    if (isBootstrappedAdmin) return true;

    if (currentUser.emailVerified) {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminSnap.exists()) return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfoMessage('');
    setIsLoggingIn(true);
    try {
      if (loginMethod === 'email') {
        const cleanEmail = loginEmail.trim();
        if (!cleanEmail) {
          setAuthError('يرجى إدخال البريد الإلكتروني');
          return;
        }
        if (!loginPassword) {
          setAuthError('يرجى إدخال كلمة المرور');
          return;
        }
        if (isEmailSignUp && loginPassword.length < 6) {
          setAuthError('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل');
          return;
        }

        const authUser = isEmailSignUp
          ? await signUpWithEmail(cleanEmail, loginPassword)
          : await signInWithEmail(cleanEmail, loginPassword);

        if (!authUser) {
          setAuthError('تعذر تسجيل الدخول بهذا البريد الإلكتروني');
          return;
        }

        if (isEmailSignUp) {
          setAuthInfoMessage(
            'تم إنشاء الحساب وإرسال رابط التفعيل إلى بريدك الإلكتروني. يرجى فتح بريدك والضغط على رابط التفعيل ثم الضغط على "تحقق من التفعيل".'
          );
          return;
        }

        if (!authUser.emailVerified) {
          setAuthError(
            'لم يتم تفعيل البريد الإلكتروني بعد. يرجى الضغط على "إرسال رابط التفعيل" وتأكيده من بريدك حتى تتمكن من حفظ التعديلات في Firebase.'
          );
          return;
        }

        const verifiedAdmin = await verifyAuthorizedAdminUser(authUser);
        if (!verifiedAdmin) {
          setAuthError(`الحساب (${authUser.email || ''}) غير مصرح له بإدارة المتجر.`);
          return;
        }

        setIsAuthenticated(true);
        return;
      }

      // Google + PIN Mode
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) {
          setAuthError('يجب تسجيل الدخول بحساب Google المعتمد للمتابعة');
          return;
        }
      }

      const verifiedAdmin = isAdmin || (await verifyAuthorizedAdminUser(currentUser));
      if (!verifiedAdmin) {
        setAuthError(`الحساب (${currentUser.email || ''}) غير مصرح له بإدارة المتجر.`);
        return;
      }

      let expectedPin = adminPinFromDb || '112233';
      try {
        const secSnap = await getDoc(doc(db, 'adminConfig', 'security'));
        if (secSnap.exists() && secSnap.data()?.adminPin) {
          expectedPin = String(secSnap.data().adminPin);
        }
      } catch {
        // Use fallback expectedPin
      }

      if (enteredPin.trim() !== expectedPin) {
        setAuthError('رمز الدخول غير صحيح');
        return;
      }

      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Admin login error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('المتصفح منع فتح نافذة Google المنبثقة. يرجى السماح بالنوافذ المنبثقة أو استخدام الدخول بالبريد الإلكتروني.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `النطاق (${window.location.hostname}) غير مضاف في النطاقات المصرح بها (Authorized Domains) في Firebase Console.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'تسجيل الدخول بالبريد الإلكتروني غير مفعل حالياً في Firebase Console (Authentication > Sign-in method > Email/Password). فعّله أو استخدم الدخول بحساب Google.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إنشاء الحساب بعد.');
      } else if (code === 'auth/email-already-in-use') {
        setAuthError('هذا البريد الإلكتروني مسجل بالفعل. قم بتسجيل الدخول بدلاً من إنشاء حساب جديد.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('صيغة البريد الإلكتروني غير صحيحة');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('محاولات كثيرة خاطئة. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
      } else {
        setAuthError(`تعذر تسجيل الدخول (${code || 'خطأ غير معروف'}).`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openNewProductForm = () => {
    setEditingProduct(null);
    setIsAddingNew(true);
    setFormName('');
    const randomCode = `JWL-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormCode(randomCode);
    setFormCategory('rings');
    setFormKarat(21);
    setFormWeight('5.0');
    setFormPrice('20000');
    setFormHidePrice(false);
    setFormInStock(true);
    setFormIsFeatured(false);
    setFormIsOffer(false);
    setFormOldPrice('');
    setFormDescription('صياغة ذهبية فاخرة متقنة مدموغة رسميًا.');
    setFormSeoTitle('');
    setFormImagesText('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80');
  };

  const openEditProduct = (prod: Product) => {
    setIsAddingNew(false);
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCode(prod.code);
    setFormCategory(prod.category);
    setFormKarat(prod.karat);
    setFormWeight(String(prod.weight || ''));
    setFormPrice(String(prod.price || ''));
    setFormHidePrice(Boolean(prod.hidePrice));
    setFormInStock(prod.inStock !== false);
    setFormIsFeatured(Boolean(prod.isFeatured));
    setFormIsOffer(Boolean(prod.isOffer));
    setFormOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
    setFormDescription(prod.description || '');
    setFormSeoTitle(prod.seoTitle || '');
    setFormImagesText(prod.images ? prod.images.join('\n') : '');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('جارٍ الحفظ في Firebase Firestore...');

    const imagesList = formImagesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const productPayload = {
      name: formName,
      code: formCode,
      category: formCategory,
      karat: Number(formKarat),
      weight: parseFloat(formWeight) || 0,
      price: parseFloat(formPrice) || 0,
      hidePrice: formHidePrice,
      inStock: formInStock,
      isFeatured: formIsFeatured,
      isOffer: formIsOffer,
      oldPrice: formOldPrice ? parseFloat(formOldPrice) : null,
      description: formDescription,
      seoTitle: formSeoTitle,
      images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'],
    };

    try {
      if (isAddingNew) {
        await createProductInFirestore({
          ...productPayload,
          isNew: true,
          order: products.length + 1,
        });
        setStatusMessage('تمت إضافة المنتج وحفظه في Firebase بنجاح');
        setIsAddingNew(false);
        onRefreshData?.();
      } else if (editingProduct) {
        await updateProductInFirestore(editingProduct.id, {
          ...editingProduct,
          ...productPayload,
        });
        setStatusMessage('تم تحديث المنتج في Firebase بنجاح');
        setEditingProduct(null);
        onRefreshData?.();
      }
    } catch (err) {
      setStatusMessage('حدث خطأ أثناء حفظ المنتج في Firebase');
    }

    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: "${name}"؟`)) return;

    try {
      await deleteProductInFirestore(id);
      setStatusMessage(`تم حذف المنتج "${name}" من Firebase`);
      onRefreshData?.();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert('حدث خطأ أثناء حذف المنتج من Firebase');
    }
  };

  const handleSaveSettings = async () => {
    setStatusMessage('جارٍ حفظ الإعدادات في Firebase...');
    const previousPin = adminPinFromDb || enteredPin || '112233';
    try {
      await saveStoreSettingsInFirestore(tempSettings);

      const cleanPin = (tempSettings.adminPin || '').trim();
      if (cleanPin && cleanPin !== adminPinFromDb) {
        await saveAdminPinInFirestore(cleanPin);
        setEnteredPin(cleanPin);
      }

      // Best-effort sync to local server settings so PC upload route PIN stays aligned
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: previousPin, settings: tempSettings }),
      }).catch(() => {});

      setStatusMessage('تم حفظ الإعدادات وتحديث الموقع فورياً في Firebase');
      onRefreshData?.();
    } catch (err: any) {
      setStatusMessage(err?.message || 'فشل حفظ الإعدادات في Firebase');
    }
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Process uploaded Excel / CSV File
  const processExcelFile = async (file: File) => {
    setIsReadingExcel(true);
    setExcelFileError('');
    setBulkImportStatus('');

    try {
      const buffer = await file.arrayBuffer();
      const existingCodes = new Set(
        products.map((p) => p.code?.trim().toUpperCase()).filter(Boolean)
      );

      const items = parseExcelData(buffer, existingCodes);
      if (items.length === 0) {
        setExcelFileError('لم يتم العثور على أي صفوف أو أصناف صالحة في الملف.');
        setIsReadingExcel(false);
        return;
      }

      setParsedExcelItems(items);
      setExcelFileName(file.name);
      setBulkImportStatus(`تمت قراءة ${items.length} صنف بنجاح من ملف: ${file.name}`);
    } catch (err: any) {
      console.error('Error reading excel file:', err);
      setExcelFileError(
        err?.message || 'حدث خطأ أثناء قراءة ملف الإكسيل. يرجى التأكد من صِيغة الملف (XLSX أو XLS أو CSV).'
      );
    } finally {
      setIsReadingExcel(false);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
    // reset input so same file can be re-selected if edited
    e.target.value = '';
  };

  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleClearExcel = () => {
    setParsedExcelItems([]);
    setExcelFileName('');
    setExcelFileError('');
    setBulkImportStatus('');
  };

  // Submit parsed Excel items to Firebase Firestore
  const handleExecuteExcelImport = async () => {
    if (parsedExcelItems.length === 0) return;

    setIsSubmittingExcel(true);
    setBulkImportStatus('جارٍ حفظ الأصناف وتحديث الكتالوج في Firebase Firestore...');

    try {
      const result = await bulkUpsertProductsInFirestore(
        parsedExcelItems,
        products,
        settings,
        updateExistingByCode
      );
      setBulkImportStatus(
        `✓ تمت المعالجة بنجاح في Firebase: إضافة ${result.addedCount} منتج جديد، وتحديث ${result.updatedCount} منتج حالي.`
      );
      onRefreshData?.();
      setTimeout(() => {
        setParsedExcelItems([]);
        setExcelFileName('');
      }, 2500);
    } catch (err) {
      setBulkImportStatus('حدث خطأ أثناء حفظ البيانات إلى Firebase Firestore.');
    } finally {
      setIsSubmittingExcel(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#111111] border border-[#C6A667]/35 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#161616] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
              alt="SOLIMAN GOLD"
              className="h-10 w-auto object-contain rounded"
            />
            <div>
              <h3 className="text-base font-bold text-[#FAF8F3]">لوحة إدارة SOLIMAN GOLD (سليمان جولد)</h3>
              <p className="text-[11px] text-stone-400">إدارة المنتجات، العروض، أسعار الذهب، وأرقام واتساب</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <>
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1C1F26] border border-[#C6A667]/30 text-[11px] text-stone-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{firestoreSynced ? 'Firebase Firestore متصل' : 'مزامنة سحابية'}</span>
                  <span className="text-stone-500">·</span>
                  <span className="font-mono text-[#E2CCA1]">{user.email}</span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logoutFirebase();
                    setIsAuthenticated(false);
                    setEnteredPin('');
                    setLoginEmail('');
                    setLoginPassword('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 border border-stone-700/70 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1E1E1E] text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-6 sm:p-10 max-w-md mx-auto text-center space-y-5 overflow-y-auto">
            <div className="flex justify-center">
              <img
                src={settings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                alt="SOLIMAN GOLD"
                className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_4px_20px_rgba(198,166,103,0.4)]"
              />
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#FAF8F3]">تسجيل دخول لوحة التحكم</h4>
              <p className="text-xs text-stone-400 mt-1">
                اختر طريقة الدخول بحساب المالك لإدارة الكتالوج والأسعار على Firebase
              </p>
            </div>

            {/* Login Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#181920] border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setAuthError('');
                  setAuthInfoMessage('');
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-[#C6A667] text-[#111111]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>البريد الإلكتروني</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('google');
                  setAuthError('');
                  setAuthInfoMessage('');
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'google'
                    ? 'bg-[#C6A667] text-[#111111]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>حساب Google + PIN</span>
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleLogin} className="space-y-3.5 text-right" autoComplete="off">
                {user && isAdmin && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/40 flex items-center justify-between gap-2">
                    <div className="text-right min-w-0">
                      <p className="text-[11px] text-emerald-300 font-bold">جلسة مالك نشطة</p>
                      <p className="text-[11px] font-mono text-stone-300 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthenticated(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shrink-0 cursor-pointer"
                    >
                      دخول مباشر
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-stone-300 font-semibold mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="admin-login-email"
                    autoComplete="off"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني..."
                    dir="ltr"
                    className="w-full py-3 px-3.5 rounded-xl bg-[#181818] border border-stone-700 text-sm text-white placeholder-stone-500 focus:border-[#C6A667] outline-none text-left"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 font-semibold mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPin ? 'text' : 'password'}
                      name="admin-login-password"
                      autoComplete="new-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full py-3 px-3.5 pl-10 rounded-xl bg-[#181818] border border-stone-700 text-sm font-mono text-white placeholder-stone-500 focus:border-[#C6A667] outline-none text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
                      title={showLoginPin ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Email verification banner when signed in but unverified */}
                {user && !user.emailVerified && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs space-y-2 text-center">
                    <p>الحساب ({user.email}) مسجل لكنه غير مفعّل بعد.</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await resendVerificationEmail();
                            setAuthInfoMessage('تم إرسال رابط التفعيل إلى بريدك الإلكتروني.');
                          } catch {
                            setAuthError('تعذر إرسال رابط التفعيل حالياً. حاول بعد دقيقة.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-[11px] cursor-pointer"
                      >
                        إرسال رابط التفعيل
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const refreshed = await refreshCurrentUser();
                          if (refreshed?.emailVerified) {
                            const ok = await verifyAuthorizedAdminUser(refreshed);
                            if (ok) {
                              setIsAuthenticated(true);
                              return;
                            }
                          }
                          setAuthError('لم يتم تأكيد التفعيل بعد. افتح الرابط المرسل لبريدك ثم أعد المحاولة.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-[11px] cursor-pointer"
                      >
                        تحقق من التفعيل
                      </button>
                    </div>
                  </div>
                )}

                {authInfoMessage && (
                  <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800 text-center">
                    {authInfoMessage}
                  </p>
                )}

                {authError && (
                  <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800 text-center">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-[#C6A667] hover:bg-[#E2CCA1] text-[#111111] font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoggingIn
                    ? 'جارٍ التحقق...'
                    : isEmailSignUp
                      ? 'إنشاء الحساب وإرسال التفعيل'
                      : 'دخول'}
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailSignUp(!isEmailSignUp);
                      setAuthError('');
                      setAuthInfoMessage('');
                    }}
                    className="text-[#C6A667] hover:underline cursor-pointer"
                  >
                    {isEmailSignUp
                      ? 'لديك حساب بالفعل؟ العودة لتسجيل الدخول'
                      : 'حساب جديد بالبريد الإلكتروني؟ إنشاء حساب'}
                  </button>

                  {user && (
                    <button
                      type="button"
                      onClick={() => logoutFirebase()}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      تسجيل خروج ({user.email})
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Google Account Status Card */}
                <div className="p-3.5 rounded-xl bg-[#16171F] border border-stone-800 text-xs space-y-2.5">
                  {user ? (
                    <div className="flex items-center justify-between gap-2 text-right">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${isAdmin ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {isAdmin ? 'تم التحقق من حساب المالك' : 'حساب غير مصرح له بالإدارة'}
                          </p>
                          <p className="text-[11px] font-mono text-stone-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => logoutFirebase()}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] shrink-0 cursor-pointer"
                      >
                        تبديل
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setAuthError('');
                        try {
                          await signInWithGoogle();
                        } catch (err: any) {
                          const code = err?.code || '';
                          if (code === 'auth/unauthorized-domain') {
                            setAuthError(
                              `النطاق (${window.location.hostname}) غير مضاف في Authorized Domains داخل Firebase Console.`
                            );
                          } else if (code === 'auth/popup-blocked') {
                            setAuthError('المتصفح منع النافذة المنبثقة. اسمح بالنوافذ المنبثقة أو استخدم تبويب البريد الإلكتروني.');
                          } else {
                            setAuthError('تعذر فتح نافذة تسجيل الدخول بحساب Google');
                          }
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#1F222E] hover:bg-[#2A2E3D] border border-[#C6A667]/40 text-[#FAF8F3] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#C6A667]" />
                      <span>تسجيل الدخول بحساب Google المعتمد</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showLoginPin ? 'text' : 'password'}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder="رمز الأمان (••••••)"
                      className="w-full text-center py-3 px-10 rounded-xl bg-[#181818] border border-stone-700 text-lg font-mono text-white tracking-widest focus:border-[#C6A667] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
                      title={showLoginPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                    >
                      {showLoginPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-[#C6A667] hover:bg-[#E2CCA1] text-[#111111] font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isLoggingIn ? 'جارٍ التحقق...' : 'دخول'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard Tabs */
          <div className="flex flex-col flex-1 min-h-0">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-[#121318] overflow-x-auto shrink-0">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsAddingNew(false);
                  setEditingProduct(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>المنتجات ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('gold')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'gold'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>إدارة أسعار الذهب</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>إعدادات المتجر وواتساب</span>
              </button>

              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'bulk'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>استيراد إكسيل (شيت البرنامج)</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'media'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>مكتبة ورفع الصور من الكمبيوتر</span>
              </button>
            </div>

            {/* Status Message Toast */}
            {statusMessage && (
              <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/30 text-[#D4AF37] text-xs py-2 px-6 flex items-center gap-2 font-medium">
                <Check className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Tab 1: Products Management */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {isAddingNew || editingProduct ? (
                  /* Add / Edit Form */
                  <form onSubmit={handleSaveProduct} className="p-5 rounded-xl bg-[#14161C] border border-stone-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h4 className="text-sm font-bold text-[#FAF6ED]">
                        {isAddingNew ? 'إضافة منتج جديد للكتالوج' : `تعديل المنتج: ${editingProduct?.name}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingProduct(null);
                        }}
                        className="text-xs text-stone-400 hover:text-white"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-stone-400 mb-1">اسم المنتج *</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                          placeholder="مثال: طقم شبكة عروس عيار 21"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1">كود المنتج (فريد) *</label>
                        <input
                          type="text"
                          required
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#D4AF37] outline-none uppercase"
                          placeholder="مثال: BGL-2105"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1">التصنيف *</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                        >
                          {categories
                            .filter((c) => c.id !== 'all')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1">العيار *</label>
                        <select
                          value={formKarat}
                          onChange={(e) => setFormKarat(Number(e.target.value))}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                        >
                          <option value={18}>عيار 18</option>
                          <option value={21}>عيار 21</option>
                          <option value={24}>عيار 24</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1">الوزن بالجرام</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formWeight}
                          onChange={(e) => setFormWeight(e.target.value)}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#D4AF37] outline-none"
                          placeholder="مثال: 15.4"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1">السعر بالجنيه المصري</label>
                        <input
                          type="number"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#D4AF37] outline-none"
                          placeholder="مثال: 60000"
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1A1C24] border border-stone-800 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="rounded text-[#D4AF37]"
                        />
                        <span className="text-white">متوفر في المحل</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1A1C24] border border-stone-800 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={formHidePrice}
                          onChange={(e) => setFormHidePrice(e.target.checked)}
                          className="rounded text-[#D4AF37]"
                        />
                        <span className="text-white">إخفاء السعر (اسأل عنه)</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1A1C24] border border-stone-800 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="rounded text-[#D4AF37]"
                        />
                        <span className="text-white">قطعة مميزة في الواجهة</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1A1C24] border border-stone-800 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={formIsOffer}
                          onChange={(e) => setFormIsOffer(e.target.checked)}
                          className="rounded text-[#D4AF37]"
                        />
                        <span className="text-white">عرض خاص / خصم</span>
                      </label>
                    </div>

                    {/* Images Section with Local Computer Upload */}
                    <div className="space-y-3 p-4 rounded-xl bg-[#1A1C24] border border-stone-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="block text-sm font-bold text-[#FAF6ED]">
                            صور القطعة ({currentImagesList.length})
                          </label>
                          <span className="text-[11px] text-stone-400">
                            الصورة الأولى هي صورة الغلاف الرئيسية في الموقع. يمكنك رفع صور من جهازك أو سحبها مباشرة.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* File input button */}
                          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs cursor-pointer shadow-md transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع صور من الكمبيوتر</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              disabled={isUploadingFormImages}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  uploadFormImages(Array.from(e.target.files));
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                            className="px-2.5 py-2 rounded-lg bg-[#252838] hover:bg-[#2F3347] text-stone-300 text-xs transition-colors cursor-pointer"
                            title="إدخال روابط خارجية يدوياً"
                          >
                            {showManualUrlInput ? 'إخفاء الروابط' : 'روابط يدوية'}
                          </button>
                        </div>
                      </div>

                      {/* Drop Zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            uploadFormImages(Array.from(e.dataTransfer.files));
                          }
                        }}
                        className="border-2 border-dashed border-stone-700 hover:border-[#D4AF37]/60 rounded-xl p-4 text-center bg-[#13141B]/70 transition-colors"
                      >
                        <p className="text-xs text-stone-300 font-medium">
                          اسحب صور الذهب وأفلتها هنا للرفع الفوري من جهازك
                        </p>
                        <p className="text-[10px] text-stone-500 mt-1">
                          يدعم صور JPG, PNG, WEBP بدقة عالية
                        </p>
                      </div>

                      {/* Uploading indicator */}
                      {isUploadingFormImages && (
                        <div className="p-2.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ حفظ الصور على الخادم وإضافتها للقطعة...</span>
                        </div>
                      )}

                      {/* Images Thumbnails Grid */}
                      {currentImagesList.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                          {currentImagesList.map((imgUrl, idx) => (
                            <div
                              key={`${imgUrl}-${idx}`}
                              className={`relative group rounded-lg overflow-hidden border ${
                                idx === 0 ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-stone-700'
                              } bg-[#111217] aspect-square flex flex-col justify-between`}
                            >
                              <img
                                src={imgUrl}
                                alt={`صورة ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
                                }}
                              />

                              {/* Cover Badge */}
                              {idx === 0 && (
                                <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-[#D4AF37] text-black text-[10px] font-bold shadow">
                                  الغلاف
                                </div>
                              )}

                              {/* Hover Overlay Controls */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-[11px]">
                                {idx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverImage(idx)}
                                    className="w-full py-1 px-2 rounded bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-[10px] transition-colors cursor-pointer"
                                  >
                                    جعله الغلاف
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopyUrl(imgUrl)}
                                  className="w-full py-1 px-2 rounded bg-stone-700 hover:bg-stone-600 text-white text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                  {copiedUrl === imgUrl ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>تم النسخ</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>نسخ الرابط</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFormImage(idx)}
                                  className="w-full py-1 px-2 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500 py-1">
                          لم يتم إرفاق صور بعد. يرجى الضغط على زر "رفع صور من الكمبيوتر".
                        </p>
                      )}

                      {/* Optional Manual Textarea for Direct URLs */}
                      {showManualUrlInput && (
                        <div className="pt-2 border-t border-stone-800 mt-2">
                          <label className="block text-[11px] text-stone-400 mb-1">
                            تعديل روابط الصور يدويًا (رابط في كل سطر):
                          </label>
                          <textarea
                            rows={3}
                            value={formImagesText}
                            onChange={(e) => setFormImagesText(e.target.value)}
                            className="w-full bg-[#121319] border border-stone-700 rounded-lg p-2 font-mono text-xs text-stone-200 focus:border-[#D4AF37] outline-none"
                            placeholder="/uploads/...&#10;https://..."
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">وصف مختصر للقطعة</label>
                      <textarea
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-xs text-stone-200 focus:border-[#D4AF37] outline-none"
                        placeholder="تفاصيل الصياغة، النقش، القفل، والدمغة..."
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">عنوان SEO (للأرشفة ومحركات البحث ومواقع التواصل)</label>
                      <input
                        type="text"
                        value={formSeoTitle}
                        onChange={(e) => setFormSeoTitle(e.target.value)}
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                        placeholder="مثال: خاتم سوليتير ذهب عيار 18 فخم للعرائس | سليمان جولد"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F3E5AB] cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isAddingNew ? 'حفظ وإضافة للموقع' : 'تحديث بيانات المنتج'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Header and Fast Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#14151C] p-4 rounded-xl border border-stone-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#FAF6ED]">
                            إدارة ورفع صور المنتجات ({products.length} قطعة)
                          </h4>
                          {products.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                              {products.filter((p) => p.images && p.images.some((img) => img.startsWith('/uploads/'))).length} صورة مرفوعة من جهازك
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          يمكنك رفع صورة خاصة لكل منتج مباشرة من جهاز الكمبيوتر بالنقر على أيقونة الكاميرا أو الزر المخصص.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('bulk')}
                          className="px-3 py-2 rounded-lg bg-[#1B1D26] hover:bg-[#252836] text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          title="استيراد الأصناف مباشرة من شيت إكسيل البرنامج"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>استيراد شيت إكسيل</span>
                        </button>

                        <button
                          type="button"
                          onClick={openNewProductForm}
                          className="px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة قطعة يدوياً</span>
                        </button>

                        {products.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowClearAllConfirmModal(true)}
                            className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            title="مسح وتفريغ كافة المنتجات من المتجر نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>مسح كل المنتجات ({products.length})</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRestoreDefaultProducts}
                            className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="استعادة المنتجات التجريبية الافتراضية"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>استعادة المنتجات التجريبية</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter and View Mode Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111217] p-3 rounded-xl border border-stone-800/80">
                      
                      {/* Search & Photo Filter Pills */}
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative w-full sm:w-56">
                          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            placeholder="بحث بالاسم أو الكود..."
                            className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-[#D4AF37] outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-[#181922] rounded-lg border border-stone-800 text-xs">
                          <button
                            type="button"
                            onClick={() => setProductPhotoFilter('all')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              productPhotoFilter === 'all'
                                ? 'bg-[#D4AF37] text-black font-bold'
                                : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            الكل ({products.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductPhotoFilter('needsPhoto')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              productPhotoFilter === 'needsPhoto'
                                ? 'bg-amber-500 text-black font-bold'
                                : 'text-amber-400/80 hover:text-amber-300'
                            }`}
                          >
                            بحاجة لصورة ({products.filter((p) => !p.images || !p.images.some((img) => img.startsWith('/uploads/'))).length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductPhotoFilter('hasPhoto')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              productPhotoFilter === 'hasPhoto'
                                ? 'bg-emerald-500 text-black font-bold'
                                : 'text-emerald-400/80 hover:text-emerald-300'
                            }`}
                          >
                            تم رفع صورة ({products.filter((p) => p.images && p.images.some((img) => img.startsWith('/uploads/'))).length})
                          </button>
                        </div>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 bg-[#181922] p-1 rounded-lg border border-stone-800 shrink-0 self-end lg:self-auto">
                        <button
                          type="button"
                          onClick={() => setProductsViewMode('table')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            productsViewMode === 'table'
                              ? 'bg-[#282B3B] text-white shadow'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>عرض الجدول</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductsViewMode('photoGrid')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            productsViewMode === 'photoGrid'
                              ? 'bg-[#D4AF37] text-black shadow font-bold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <Grid className="w-3.5 h-3.5" />
                          <span>شبكة رفع الصور السريعة</span>
                        </button>
                      </div>

                    </div>

                    {/* Empty State when no products exist */}
                    {products.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl bg-[#14151C] border border-stone-800 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#D4AF37]">
                          <Layers className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-white">الكتالوج فارغ حالياً (0 منتج)</h4>
                          <p className="text-xs text-stone-400 max-w-md mx-auto">
                            تم تفريغ كافة المنتجات بنجاح. يمكنك الآن استيراد شيت إكسيل جديد خاص ببرنامجك، أو إضافة قطع يدوياً، أو استعادة المنتجات التجريبية.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('bulk')}
                            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
                            <span>استيراد شيت إكسيل الآن</span>
                          </button>

                          <button
                            type="button"
                            onClick={openNewProductForm}
                            className="px-4 py-2.5 rounded-xl bg-[#1B1D26] hover:bg-[#252836] text-white border border-stone-700 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>إضافة قطعة يدوياً</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRestoreDefaultProducts}
                            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                            <span>استعادة المنتجات التجريبية</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* View 1: Table View */}
                        {productsViewMode === 'table' && (
                      <div className="rounded-xl border border-stone-800 overflow-hidden bg-[#131419]">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-[#181920] text-stone-400 border-b border-stone-800">
                            <tr>
                              <th className="p-3">صورة المنتج (انقر للرفع)</th>
                              <th className="p-3">اسم المنتج</th>
                              <th className="p-3">الكود</th>
                              <th className="p-3">العيار والوزن</th>
                              <th className="p-3">السعر</th>
                              <th className="p-3">حالة الصورة</th>
                              <th className="p-3 text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800/80">
                            {products
                              .filter((p) => {
                                const q = productSearchQuery.toLowerCase();
                                const matchesSearch =
                                  !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                                if (!matchesSearch) return false;
                                const isUploaded = p.images && p.images.some((img) => img.startsWith('/uploads/'));
                                if (productPhotoFilter === 'needsPhoto') return !isUploaded;
                                if (productPhotoFilter === 'hasPhoto') return isUploaded;
                                return true;
                              })
                              .map((p) => {
                                const isUploaded = p.images && p.images.some((img) => img.startsWith('/uploads/'));
                                const isCurrentlyUploading = uploadingProductId === p.id;

                                return (
                                  <tr key={p.id} className="hover:bg-[#1A1C23] transition-colors">
                                    {/* Thumbnail with 1-click Local PC File Upload */}
                                    <td className="p-3">
                                      <label
                                        className="relative group cursor-pointer block w-12 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-stone-700 hover:border-[#D4AF37] transition-all shadow"
                                        title="انقر لرفع صورة لهذا المنتج من الكمبيوتر مباشرة"
                                      >
                                        <img
                                          src={p.images[0]}
                                          alt={p.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
                                          }}
                                        />

                                        {isCurrentlyUploading ? (
                                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                            <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
                                          </div>
                                        ) : (
                                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            <Camera className="w-4 h-4 text-[#D4AF37]" />
                                            <span className="text-[8px] text-stone-200 mt-0.5">رفع</span>
                                          </div>
                                        )}

                                        <input
                                          type="file"
                                          accept="image/*"
                                          disabled={isCurrentlyUploading}
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              handleDirectProductImageUpload(p, e.target.files[0]);
                                              e.target.value = '';
                                            }
                                          }}
                                          className="hidden"
                                        />
                                      </label>
                                    </td>

                                    <td className="p-3">
                                      <span className="font-semibold text-white truncate max-w-xs block">
                                        {p.name}
                                      </span>
                                    </td>

                                    <td className="p-3 font-mono text-[#D4AF37] font-bold">
                                      #{p.code}
                                    </td>

                                    <td className="p-3 text-stone-300">
                                      عيار {p.karat} · {p.weight} جم
                                    </td>

                                    <td className="p-3 font-mono font-bold text-stone-200">
                                      {p.hidePrice ? 'مخفي (اسأل)' : formatCurrency(p.price, settings.currency)}
                                    </td>

                                    <td className="p-3">
                                      {isUploaded ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                                          <Check className="w-3 h-3" />
                                          <span>مرفوعة من جهازك</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                                          <span>افتراضية (تحتاج صورة)</span>
                                        </span>
                                      )}
                                    </td>

                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {/* Direct Photo Upload Button */}
                                        <label
                                          className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-semibold text-[11px] cursor-pointer flex items-center gap-1 transition-colors border border-[#D4AF37]/30"
                                          title="رفع صورة من الكمبيوتر لهذا المنتج"
                                        >
                                          {isCurrentlyUploading ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Camera className="w-3.5 h-3.5" />
                                          )}
                                          <span>رفع صورة</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            disabled={isCurrentlyUploading}
                                            onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                handleDirectProductImageUpload(p, e.target.files[0]);
                                                e.target.value = '';
                                              }
                                            }}
                                            className="hidden"
                                          />
                                        </label>

                                        <button
                                          onClick={() => openEditProduct(p)}
                                          className="p-1.5 rounded hover:bg-stone-700 text-stone-300 hover:text-[#D4AF37] transition-colors"
                                          title="تعديل تفاصيل الصنف"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteProduct(p.id, p.name)}
                                          className="p-1.5 rounded hover:bg-red-900/30 text-stone-400 hover:text-red-400 transition-colors"
                                          title="حذف الصنف"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* View 2: Fast Photo Upload Grid */}
                    {productsViewMode === 'photoGrid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products
                          .filter((p) => {
                            const q = productSearchQuery.toLowerCase();
                            const matchesSearch =
                              !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                            if (!matchesSearch) return false;
                            const isUploaded = p.images && p.images.some((img) => img.startsWith('/uploads/'));
                            if (productPhotoFilter === 'needsPhoto') return !isUploaded;
                            if (productPhotoFilter === 'hasPhoto') return isUploaded;
                            return true;
                          })
                          .map((p) => {
                            const isUploaded = p.images && p.images.some((img) => img.startsWith('/uploads/'));
                            const isCurrentlyUploading = uploadingProductId === p.id;

                            return (
                              <div
                                key={p.id}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleDirectProductImageUpload(p, e.dataTransfer.files[0]);
                                  }
                                }}
                                className={`rounded-2xl p-4 bg-[#14151C] border ${
                                  isUploaded ? 'border-stone-800' : 'border-amber-700/40 bg-amber-950/10'
                                } hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-3 group`}
                              >
                                {/* Header with code and karat */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-[#D4AF37] font-bold">#{p.code}</span>
                                  <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px]">
                                    عيار {p.karat} · {p.weight} جم
                                  </span>
                                </div>

                                {/* Main Photo with Drag & Drop Zone */}
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/50 border border-stone-700/80">
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />

                                  {/* Badge on Photo */}
                                  <div className="absolute top-2 right-2">
                                    {isUploaded ? (
                                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shadow flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        <span>صورة جهازك</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow">
                                        تحتاج صورة
                                      </span>
                                    )}
                                  </div>

                                  {isCurrentlyUploading && (
                                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 text-[#D4AF37] text-xs">
                                      <RefreshCw className="w-6 h-6 animate-spin" />
                                      <span>جارٍ رفع الصورة...</span>
                                    </div>
                                  )}
                                </div>

                                {/* Title & Price */}
                                <div>
                                  <h5 className="font-semibold text-white text-xs line-clamp-2" title={p.name}>
                                    {p.name}
                                  </h5>
                                  <p className="text-[#D4AF37] font-mono font-bold text-xs mt-1">
                                    {p.hidePrice ? 'السعر مخفي (واتساب)' : formatCurrency(p.price, settings.currency)}
                                  </p>
                                </div>

                                {/* Direct Computer File Upload Button */}
                                <div className="pt-1">
                                  <label className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <span>{isUploaded ? 'تغيير الصورة من الكمبيوتر' : 'رفع صورة من الكمبيوتر'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isCurrentlyUploading}
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleDirectProductImageUpload(p, e.target.files[0]);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {/* Edit / Delete secondary actions */}
                                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800/80 text-stone-400">
                                  <button
                                    type="button"
                                    onClick={() => openEditProduct(p)}
                                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>تعديل التفاصيل</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>حذف</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Confirmation Modal: Clear All Products */}
            {showClearAllConfirmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#151720] border border-rose-600/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
                  <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                    <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">تأكيد مسح كافة المنتجات</h3>
                      <p className="text-xs text-rose-400 font-medium">إجراء نهائي لتفريغ الكتالوج بالكامل</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed bg-[#101116] p-4 rounded-xl border border-stone-800/80">
                    <p>
                      أنت على وشك مسح جميع الأصناف والمنتجات المسجلة في المتجر بالكامل (عدد <strong className="text-rose-400 font-mono text-sm">{products.length}</strong> قطعة ذهب).
                    </p>
                    <p className="text-stone-400 text-[11px]">
                      ⚠️ سيتم إفراغ الكتالوج تماماً ليصبح جاهزاً لرفع منتجاتك الخاصة أو استيراد ملف إكسيل جديد من برنامجك.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleClearAllProducts}
                      disabled={isClearingAllProducts}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-rose-900/30 disabled:opacity-50"
                    >
                      {isClearingAllProducts ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ مسح المنتجات...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>نعم، امسح كل المنتجات ({products.length})</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowClearAllConfirmModal(false)}
                      disabled={isClearingAllProducts}
                      className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#222430] hover:bg-[#2C2F40] text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      إلغاء وتراجع
                    </button>
                  </div>
                </div>
              </div>
            )}

              </div>
            )}

            {/* Tab 2: Gold Prices Management with Auto-Calculation from 21k */}
            {activeTab === 'gold' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-5 rounded-xl bg-[#14151B] border border-stone-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF8F3]">تحديث أسعار الذهب وبورصة الصاغة</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        تعديل سعر عيار 21 يحسب باقي العيارات والجنيه الذهب تلقائيًا بالمعادلات الرسمية
                      </p>
                    </div>

                    {/* Auto Calculation Toggle */}
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-[#1B1B1B] border border-[#C6A667]/40 cursor-pointer text-xs font-semibold text-[#E2CCA1]">
                      <input
                        type="checkbox"
                        checked={autoCalcFrom21}
                        onChange={(e) => setAutoCalcFrom21(e.target.checked)}
                        className="rounded text-[#C6A667] accent-[#C6A667]"
                      />
                      <span>حساب تلقائي من عيار 21 (معادلات الصاغة)</span>
                    </label>
                  </div>

                  {/* Formula banner when autoCalc is active */}
                  {autoCalcFrom21 && (
                    <div className="p-3.5 rounded-xl bg-[#1A1813] border border-[#C6A667]/30 text-xs text-[#E2CCA1] space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-[#C6A667]">
                        <Sparkles className="w-4 h-4" />
                        <span>معادلات الصاغة المطبقة لحظيًا:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-stone-300 font-mono">
                        <div>• عيار 24 = عيار 21 × (24 ÷ 21) ≈ {Math.round(tempSettings.goldPrices.karat21 * (24/21))} ج.م</div>
                        <div>• عيار 18 = عيار 21 × (18 ÷ 21) ≈ {Math.round(tempSettings.goldPrices.karat21 * (18/21))} ج.م</div>
                        <div>• الجنيه الذهب = عيار 21 × 8 جم = {tempSettings.goldPrices.karat21 * 8} ج.م</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Primary Anchor: Karat 21 */}
                    <div className="p-3 rounded-xl bg-[#201D17] border-2 border-[#C6A667] shadow-[0_0_15px_rgba(198,166,103,0.15)]">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[#C6A667] font-bold">عيار 21 (المعيار الأساسي)</label>
                        <span className="text-[10px] bg-[#C6A667] text-[#111111] px-1.5 py-0.2 rounded font-bold">الأساس</span>
                      </div>
                      <input
                        type="number"
                        value={tempSettings.goldPrices.karat21}
                        onChange={(e) => handleKarat21Change(Number(e.target.value))}
                        className="w-full bg-[#141414] border border-[#C6A667]/60 rounded-lg p-2.5 font-mono text-base font-bold text-white focus:border-[#C6A667] outline-none"
                        placeholder="3800"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">تغيير هذا السعر يحدث بقية الأسعار آليًا</span>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">عيار 24 النقي (ج.م للجرام)</label>
                      <input
                        type="number"
                        value={tempSettings.goldPrices.karat24}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            goldPrices: {
                              ...tempSettings.goldPrices,
                              karat24: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#C6A667] outline-none"
                      />
                      {autoCalcFrom21 && <span className="text-[10px] text-[#C6A667] mt-1 block">محسوب: 21 × (24/21)</span>}
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">عيار 18 (ج.م للجرام)</label>
                      <input
                        type="number"
                        value={tempSettings.goldPrices.karat18}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            goldPrices: {
                              ...tempSettings.goldPrices,
                              karat18: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#C6A667] outline-none"
                      />
                      {autoCalcFrom21 && <span className="text-[10px] text-[#C6A667] mt-1 block">محسوب: 21 × (18/21)</span>}
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">الجنيه الذهب (8 جم 21k)</label>
                      <input
                        type="number"
                        value={tempSettings.goldPrices.goldPound}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            goldPrices: {
                              ...tempSettings.goldPrices,
                              goldPound: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 font-mono text-white focus:border-[#C6A667] outline-none"
                      />
                      {autoCalcFrom21 && <span className="text-[10px] text-[#C6A667] mt-1 block">محسوب: 8 × عيار 21</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">نص إخلاء المسؤولية والتنبيه للمستهلك</label>
                    <textarea
                      rows={2}
                      value={tempSettings.priceDisclaimer}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, priceDisclaimer: e.target.value })
                      }
                      className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-xs text-white focus:border-[#C6A667] outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 rounded-lg bg-[#C6A667] text-[#111111] font-bold text-xs hover:bg-[#E2CCA1] cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتطبيق أسعار الذهب على الموقع فورًا</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Store & WhatsApp Settings */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Global Price Visibility Mode Control */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-[#171510] to-[#14151B] border-2 border-[#C6A667]/40 shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C6A667]/20 border border-[#C6A667]/40 flex items-center justify-center text-[#C6A667] shrink-0">
                        {tempSettings.hideAllPrices ? <EyeOff className="w-5 h-5 text-amber-400" /> : <Eye className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#FAF6ED] flex items-center gap-2">
                          <span>سياسة عرض أسعار المنتجات في الموقع</span>
                          {tempSettings.hideAllPrices ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                              مخفية (استفسار واتساب)
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                              معروضة بالأرقام
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          التحكم في إظهار أو إخفاء الأسعار الرقمية في صفحات الكتالوج وتفاصيل القطع
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#201D17] border border-[#C6A667]/50 cursor-pointer text-xs font-bold text-white hover:bg-[#2A261D] transition-colors shrink-0">
                      <input
                        type="checkbox"
                        checked={Boolean(tempSettings.hideAllPrices)}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, hideAllPrices: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#C6A667] accent-[#C6A667] cursor-pointer"
                      />
                      <span>إخفاء جميع الأسعار والاعتماد على استفسار واتساب</span>
                    </label>
                  </div>

                  <div className="p-3 rounded-lg bg-[#111111]/80 border border-stone-800 text-[11px] text-stone-300 leading-relaxed flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                    <span>
                      {tempSettings.hideAllPrices
                        ? 'الوضع الحالي مفعل: جميع بطاقات المنتجات وتفاصيلها وسلة الطلبات تعرض "اسأل عن السعر عبر واتساب". عند ضغط العميل، يتم توجيهه لمحادثتكم على واتساب مع تفاصيل القطعة للاستفسار عن السعر اللحظي الدقيق والمصنعية حسب بورصة الذهب اليوم.'
                        : 'الوضع الحالي: يتم عرض الأسعار بالأرقام للعملاء. يمكنك تفعيل الخيار أعلاه في أي وقت لإخفاء الأرقام وتوجيه العملاء للواتساب مباشرة.'}
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#14151B] border border-stone-800 space-y-4">
                  <h4 className="text-sm font-bold text-[#FAF6ED]">بيانات وهوية المحل ورقم الواتساب</h4>

                  {/* Brand Logo Card */}
                  <div className="p-4 rounded-xl bg-[#181922] border border-[#C6A667]/25 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={tempSettings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                      alt="شعار المحل"
                      className="h-16 w-auto object-contain rounded-lg border border-[#C6A667]/30 bg-black p-1 shrink-0 shadow-md"
                    />
                    <div className="flex-1 w-full text-xs">
                      <label className="block text-[#FAF8F3] font-bold mb-1">شعار المحل المعتمد (اللوجو)</label>
                      <input
                        type="text"
                        value={tempSettings.logoUrl || '/assets/aistudio/logo_20a2cea5.jpeg'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, logoUrl: e.target.value })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-[11px] focus:border-[#C6A667] outline-none"
                        placeholder="/assets/aistudio/logo_20a2cea5.jpeg"
                      />
                      <span className="text-[10px] text-[#C6A667] mt-1 block font-medium">
                        ✓ تم تفعيل وربط الشعار الرسمي (SOLIMAN GOLD · تأنقي) في الهيدر، الفوتر، والبانر
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1">اسم محل المجوهرات *</label>
                      <input
                        type="text"
                        value={tempSettings.storeName}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, storeName: e.target.value })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">
                        رقم واتساب المحل (مباشر لاستقبال الطلبات) *
                      </label>
                      <input
                        type="text"
                        value={tempSettings.whatsappNumber}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })
                        }
                        className="w-full bg-[#1A1C24] border border-[#25D366]/50 rounded-lg p-2.5 font-mono text-emerald-400 focus:border-[#25D366] outline-none"
                        placeholder="201012345678 أو 01012345678"
                      />
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        مثال: 01001234567 أو 201001234567 (يتم ربطه تلقائياً بروابط wa.me)
                      </span>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">رقم هاتف الاتصال المباشر</label>
                      <input
                        type="text"
                        value={tempSettings.phoneNumber}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, phoneNumber: e.target.value })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">ساعات العمل والدوام</label>
                      <input
                        type="text"
                        value={tempSettings.workHours}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, workHours: e.target.value })
                        }
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">عنوان الفروع والمحل</label>
                    <input
                      type="text"
                      value={tempSettings.address}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, address: e.target.value })
                      }
                      className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">عنوان البانر الرئيسي في الصفحة الأولى</label>
                    <input
                      type="text"
                      value={tempSettings.heroBannerTitle}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, heroBannerTitle: e.target.value })
                      }
                      className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">الشريط الإخباري المتحرك أعلى الموقع</label>
                    <input
                      type="text"
                      value={tempSettings.announcementBar}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, announcementBar: e.target.value })
                      }
                      className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 text-white focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  {/* Admin Password / PIN Security */}
                  <div className="p-4 rounded-xl bg-[#181922] border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#C6A667]" />
                        <label className="block text-white font-bold text-xs">
                          رمز مرور لوحة التحكم (الرقم السري)
                        </label>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        مخفي لحماية لوحة التحكم
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showSettingsPin ? 'text' : 'password'}
                        value={tempSettings.adminPin || ''}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, adminPin: e.target.value })
                        }
                        placeholder="••••••"
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg p-2.5 pl-10 text-white font-mono tracking-widest text-sm focus:border-[#C6A667] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSettingsPin(!showSettingsPin)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
                        title={showSettingsPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                      >
                        {showSettingsPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      الرمز السري الحالي هو 112233. يمكنك تعديله وحفظ التغييرات في أي وقت.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F3E5AB] cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات في الموقع</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Excel Import (.xlsx / .xls / .csv) for POS program */}
            {activeTab === 'bulk' && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* Header & Template Download */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#171922] via-[#14151C] to-[#171922] border border-[#C6A667]/25 space-y-4 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                          <FileSpreadsheet className="w-5 h-5" />
                        </span>
                        <h4 className="text-base font-bold text-[#FAF8F3]">
                          استيراد الأصناف عبر إكسيل (شيت برنامج المحل)
                        </h4>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        قم برفع ملف الإكسيل المصدر مباشرة من برنامج نقاط البيع / الصاغة لديك. يتعرف النظام تلقائياً على الأعمدة الستة المحددة ويحدث الكتالوج فورياً.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={downloadSampleExcelTemplate}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#202330] hover:bg-[#282C3D] border border-[#C6A667]/40 text-[#FAF8F3] hover:text-[#C6A667] text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                      title="تحميل ملف إكسيل حقيقي يحتوي على الـ 6 أعمدة ونماذج بيانات"
                    >
                      <Download className="w-4 h-4 text-[#C6A667]" />
                      <span>تحميل نموذج إكسيل تجريبي (.xlsx)</span>
                    </button>
                  </div>

                  {/* 6 Required Columns Badges */}
                  <div className="pt-2 border-t border-stone-800/80">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>أعمدة الشيت المعتمدة (8 أعمدة رسمية):</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 1</span>
                        <span className="font-bold text-[#FAF8F3]">كود المنتج</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 2</span>
                        <span className="font-bold text-[#FAF8F3]">اسم المنتج (SEO)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 3</span>
                        <span className="font-bold text-[#FAF8F3]">التصنيف</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 4</span>
                        <span className="font-bold text-[#FAF8F3]">العيار</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 5</span>
                        <span className="font-bold text-[#FAF8F3]">الوزن الظاهر (جرام)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 6</span>
                        <span className="font-bold text-[#FAF8F3]">وصف مختصر</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 7</span>
                        <span className="font-bold text-[#FAF8F3]">عنوان SEO</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1B1D27] border border-stone-800">
                        <span className="text-[10px] text-stone-500 block mb-0.5">العمود 8</span>
                        <span className="font-bold text-[#FAF8F3]">السعر (جنيه)</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-[#171822] border border-stone-800 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400">
                      <span className="text-[#C6A667] font-bold">أقسام المحل الـ 10 المعرفة:</span>
                      {['سبايك', 'خواتم', 'دبل', 'حلقان', 'اساور', 'توينزات', 'تعاليق', 'انسيال', 'عقد', 'سلاسل'].map((name) => (
                        <span key={name} className="px-2 py-0.5 rounded bg-[#202230] text-stone-200 border border-stone-700 font-medium">
                          {name}
                        </span>
                      ))}
                      <span className="text-stone-500 text-[10px] mr-1">(يتعرف النظام تلقائياً على القسم من شيت برنامجك)</span>
                    </div>
                  </div>
                </div>

                {/* Upload Zone (when no file or when replacing) */}
                {parsedExcelItems.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleExcelDrop}
                    className="relative border-2 border-dashed border-stone-700 hover:border-[#C6A667] rounded-2xl p-8 sm:p-12 text-center transition-all bg-[#14151D]/60 hover:bg-[#161822] group"
                  >
                    <input
                      type="file"
                      id="excel-file-input"
                      accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                      onChange={handleExcelFileChange}
                      className="hidden"
                    />

                    <label
                      htmlFor="excel-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500 transition-all shadow-inner">
                        {isReadingExcel ? (
                          <RefreshCw className="w-8 h-8 animate-spin" />
                        ) : (
                          <FileUp className="w-8 h-8" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-base font-bold text-white group-hover:text-[#C6A667] transition-colors">
                          {isReadingExcel
                            ? 'جارٍ قراءة وفحص شيت الإكسيل...'
                            : 'اسحب شيت الإكسيل وأفلته هنا، أو اضغط للاختيار من جهازك'}
                        </h5>
                        <p className="text-xs text-stone-400">
                          يدعم كافة صيغ مايكروسوفت إكسيل (.xlsx و .xls) وملفات الجداول (.csv)
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C6A667] hover:bg-[#E2CCA1] text-[#111111] font-bold text-xs shadow-md transition-all">
                        <UploadCloud className="w-4 h-4" />
                        <span>اختيار ملف الشيت من الكمبيوتر أو الهاتف</span>
                      </div>
                    </label>

                    {excelFileError && (
                      <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{excelFileError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Preview Table and Confirmation Workspace */
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Summary Metrics Banner */}
                    <div className="p-4 rounded-xl bg-[#161722] border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>الملف: {excelFileName}</span>
                        </span>
                        
                        <span className="text-xs text-stone-300 bg-[#1D1F2C] px-3 py-1.5 rounded-lg border border-stone-700">
                          إجمالي المقروء: <strong className="text-white font-mono">{parsedExcelItems.length}</strong> صنف
                        </span>

                        <span className="text-xs text-[#C6A667] bg-[#C6A667]/10 px-3 py-1.5 rounded-lg border border-[#C6A667]/30">
                          جديدة: <strong className="font-mono">{parsedExcelItems.filter(i => !i.isExisting).length}</strong>
                        </span>

                        <span className="text-xs text-blue-300 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/50">
                          تحديث لموجود: <strong className="font-mono">{parsedExcelItems.filter(i => i.isExisting).length}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleClearExcel}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          تغيير الملف
                        </button>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13141B] p-3 rounded-xl border border-stone-800">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={previewSearch}
                          onChange={(e) => setPreviewSearch(e.target.value)}
                          placeholder="بحث بالكود أو اسم الصنف أو المجموعة..."
                          className="w-full bg-[#1A1C26] border border-stone-700 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C6A667] outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewFilter('all')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            previewFilter === 'all'
                              ? 'bg-[#C6A667] text-black font-bold'
                              : 'bg-[#1A1C26] text-stone-400 hover:text-white'
                          }`}
                        >
                          الكل ({parsedExcelItems.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewFilter('new')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            previewFilter === 'new'
                              ? 'bg-[#C6A667] text-black font-bold'
                              : 'bg-[#1A1C26] text-stone-400 hover:text-white'
                          }`}
                        >
                          جديدة ({parsedExcelItems.filter(i => !i.isExisting).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewFilter('existing')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            previewFilter === 'existing'
                              ? 'bg-[#C6A667] text-black font-bold'
                              : 'bg-[#1A1C26] text-stone-400 hover:text-white'
                          }`}
                        >
                          تحديث مسجل ({parsedExcelItems.filter(i => i.isExisting).length})
                        </button>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div className="rounded-xl border border-stone-800 overflow-hidden bg-[#12131A] max-h-80 overflow-y-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#181922] text-stone-400 border-b border-stone-800 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">كود المنتج</th>
                            <th className="p-3">اسم المنتج (SEO)</th>
                            <th className="p-3">التصنيف</th>
                            <th className="p-3">العيار</th>
                            <th className="p-3">الوزن الظاهر</th>
                            <th className="p-3">وصف مختصر</th>
                            <th className="p-3">عنوان SEO</th>
                            <th className="p-3">السعر (جنيه)</th>
                            <th className="p-3 text-center">حالة الصنف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/70">
                          {parsedExcelItems
                            .filter((item) => {
                              if (previewFilter === 'new' && item.isExisting) return false;
                              if (previewFilter === 'existing' && !item.isExisting) return false;
                              if (!previewSearch.trim()) return true;
                              const q = previewSearch.toLowerCase();
                              return (
                                item.name.toLowerCase().includes(q) ||
                                item.code.toLowerCase().includes(q) ||
                                item.categoryName.toLowerCase().includes(q) ||
                                (item.seoTitle && item.seoTitle.toLowerCase().includes(q))
                              );
                            })
                            .slice(0, 100)
                            .map((item, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-[#191B24] transition-colors"
                              >
                                <td className="p-3 font-mono text-stone-500 text-[11px]">{idx + 1}</td>
                                <td className="p-3 font-mono font-bold text-[#C6A667]">
                                  #{item.code}
                                </td>
                                <td className="p-3 font-semibold text-white max-w-xs truncate">
                                  {item.name}
                                </td>
                                <td className="p-3 text-stone-300">
                                  <span className="inline-block px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px]">
                                    {item.categoryName}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-amber-300 font-mono">
                                  عيار {item.karat}
                                </td>
                                <td className="p-3 font-mono text-stone-200">
                                  {item.weight > 0 ? `${item.weight} جم` : '—'}
                                </td>
                                <td className="p-3 text-stone-300 max-w-[180px] truncate text-[11px]">
                                  {item.description || '—'}
                                </td>
                                <td className="p-3 text-[#E2CCA1] max-w-[180px] truncate text-[11px] font-mono">
                                  {item.seoTitle || '—'}
                                </td>
                                <td className="p-3 font-mono font-bold text-[#C6A667]">
                                  {item.price > 0 ? formatCurrency(item.price, settings.currency) : '—'}
                                </td>
                                <td className="p-3 text-center">
                                  {item.isExisting ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full font-medium">
                                      <span>تحديث الصنف</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                                      <span>صنف جديد</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {parsedExcelItems.length > 100 && (
                      <p className="text-[11px] text-stone-500 text-center">
                        يتم عرض أول 100 صنف للمعاينة، وسيتم استيراد كافة الأصناف ({parsedExcelItems.length} صنف) بالكامل.
                      </p>
                    )}

                    {/* Options & Action Confirm Button */}
                    <div className="p-4 rounded-xl bg-[#161722] border border-stone-800 space-y-4">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-300 select-none">
                        <input
                          type="checkbox"
                          checked={updateExistingByCode}
                          onChange={(e) => setUpdateExistingByCode(e.target.checked)}
                          className="w-4 h-4 rounded text-[#C6A667] accent-[#C6A667]"
                        />
                        <span>
                          تحديث بيانات وسعر ووزن الأصناف الموجودة مسبقاً إذا كان نفس الكود مسجلاً في المتجر
                        </span>
                      </label>

                      {bulkImportStatus && (
                        <div className="p-3 rounded-lg bg-[#1B1D29] border border-[#C6A667]/40 text-xs text-[#FAF8F3] flex items-center gap-2 font-medium">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{bulkImportStatus}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleExecuteExcelImport}
                          disabled={isSubmittingExcel}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#C6A667] hover:bg-[#E2CCA1] text-[#111111] font-bold text-sm shadow-lg hover:shadow-[#C6A667]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingExcel ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جارٍ الاستيراد وحفظ البيانات...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-[#111111]" />
                              <span>تأكيد واستيراد كافة الأصناف ({parsedExcelItems.length} صنف) إلى الكتالوج</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleClearExcel}
                          disabled={isSubmittingExcel}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1D1F2C] hover:bg-[#252838] text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          إلغاء والبدء من جديد
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* Tab 5: Media Library & PC Image Upload */}
            {activeTab === 'media' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Header Information */}
                <div className="p-5 rounded-2xl bg-[#14161C] border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-[#FAF6ED]">
                        مكتبة ورفع الصور من جهاز الكمبيوتر
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      ارفع صور المشغولات والسبائك مباشرة من جهاز الكمبيوتر أو الهاتف دفعة واحدة أو بشكل فردي. يتم حفظ الصور في مجلد الميديا بالمتجر فوراً.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={fetchMediaFiles}
                      disabled={isLoadingMedia}
                      className="px-3 py-2 rounded-lg bg-[#1B1D26] hover:bg-[#252838] border border-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMedia ? 'animate-spin' : ''}`} />
                      <span>تحديث المعرض</span>
                    </button>

                    <label className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>اختيار صور من الكمبيوتر</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            processSelectedBatchFiles(Array.from(e.target.files));
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="p-6 rounded-2xl bg-[#14161C] border border-stone-800 space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processSelectedBatchFiles(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className="border-2 border-dashed border-stone-700 hover:border-[#D4AF37]/60 rounded-xl p-8 text-center bg-[#101117] transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer"
                    onClick={() => {
                      const input = document.getElementById('batch-media-file-input');
                      if (input) input.click();
                    }}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-200">
                        اسحب وأفلت صور الذهب هنا، أو اضغط لاختيار الصور من الكمبيوتر
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        يمكنك اختيار عدة صور في وقت واحد (JPG, PNG, WEBP)
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1C25] border border-stone-700 text-[11px] text-[#D4AF37]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ميزة ذكية: تسمية الصورة بكود الصنف (مثلاً RNG-1804.jpg) يربطها تلقائياً بالقطعة كغلاف</span>
                    </div>

                    <input
                      id="batch-media-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          processSelectedBatchFiles(Array.from(e.target.files));
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Batch Selection Queue */}
                  {batchFiles.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-stone-800">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#FAF6ED] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          <span>الصور المختارة للرفع ({batchFiles.length} صورة):</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setBatchFiles([])}
                          className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          تفريغ القائمة
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                        {batchFiles.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[#1B1D27] border border-stone-700 flex flex-col justify-between space-y-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                className="w-14 h-14 rounded-lg object-cover border border-stone-600 shrink-0"
                              />
                              <div className="overflow-hidden min-w-0">
                                <p className="font-semibold text-white truncate" title={item.name}>
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {(item.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>

                            {/* Product matching dropdown */}
                            <div>
                              <label className="block text-[10px] text-stone-400 mb-0.5">
                                ربط بالقطعة:
                              </label>
                              <select
                                value={item.matchedProductCode}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchFiles((prev) =>
                                    prev.map((f, i) => (i === idx ? { ...f, matchedProductCode: val } : f))
                                  );
                                }}
                                className="w-full bg-[#121319] border border-stone-600 rounded p-1 text-[11px] text-white focus:border-[#D4AF37] outline-none"
                              >
                                <option value="">(حفظ بالمعرض فقط دون ربط)</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.code}>
                                    {p.code} - {p.name.slice(0, 24)}...
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setBatchFiles((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-[10px] text-stone-400 hover:text-rose-400 text-left pt-1 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>إلغاء هذه الصورة</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Execute Upload Button */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleExecuteBatchUpload}
                          disabled={isUploadingBatch}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingBatch ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جارٍ رفع الصور وحفظها في المتجر...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>تأكيد ورفع {batchFiles.length} صورة من جهاز الكمبيوتر</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setBatchFiles([])}
                          disabled={isUploadingBatch}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:text-white transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>

                      {batchUploadResult && (
                        <div className="p-3 rounded-xl bg-[#1B1D29] border border-[#D4AF37]/40 text-xs text-[#FAF8F3] flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{batchUploadResult}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stored Media Explorer */}
                <div className="p-6 rounded-2xl bg-[#14161C] border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF6ED] flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#D4AF37]" />
                        <span>معرض الصور المخزنة بالمتجر ({combinedMediaFiles.length} صورة)</span>
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        جميع الصور المرفوعة من جهاز الكمبيوتر متاحة هنا، ويمكنك نسخ رابط أي صورة أو تعيينها لأي قطعة ذهب.
                      </p>
                    </div>

                    <div className="w-full sm:w-64 relative">
                      <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        placeholder="بحث في أسماء الصور..."
                        className="w-full bg-[#1A1C24] border border-stone-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>

                  {isLoadingMedia && combinedMediaFiles.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>جارٍ جلب مكتبة الصور...</span>
                    </div>
                  ) : combinedMediaFiles.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-stone-600" />
                      <p>لا توجد صور مرفوعة بعد من الكمبيوتر.</p>
                      <p className="text-[11px] text-stone-600">
                        استخدم صندوق الرفع بالأعلى لرفع أول مجموعة صور من جهازك!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
                      {combinedMediaFiles
                        .filter((m) =>
                          mediaSearch ? m.filename.toLowerCase().includes(mediaSearch.toLowerCase()) : true
                        )
                        .map((file) => (
                          <div
                            key={file.url}
                            className="rounded-xl overflow-hidden bg-[#181922] border border-stone-800 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group"
                          >
                            <div className="relative aspect-square bg-black overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>

                            <div className="p-2.5 space-y-2 text-xs">
                              <div className="overflow-hidden">
                                <p
                                  className="text-[11px] font-semibold text-stone-200 truncate"
                                  title={file.filename}
                                >
                                  {file.filename}
                                </p>
                                <p className="text-[10px] text-stone-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyUrl(file.url)}
                                  className="flex-1 py-1 px-1.5 rounded bg-[#222430] hover:bg-[#2C2F40] text-stone-200 text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  title="نسخ الرابط المباشر للصورة"
                                >
                                  {copiedUrl === file.url ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">تم</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>نسخ</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-[#222430] hover:bg-[#2C2F40] text-stone-400 hover:text-white transition-colors"
                                  title="عرض بالحجم الكامل"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {/* Assign to product dropdown */}
                              <div className="pt-1 border-t border-stone-800">
                                <label className="block text-[9px] text-stone-500 mb-0.5">
                                  تعيين كغلاف لقطعة:
                                </label>
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignMediaToProduct(file.url, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="w-full bg-[#121318] border border-stone-700 rounded p-1 text-[10px] text-stone-300 focus:border-[#D4AF37] outline-none"
                                >
                                  <option value="">اختر القطعة...</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.code}>
                                      {p.code} - {p.name.slice(0, 18)}...
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
