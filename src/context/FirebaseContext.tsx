import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase';
import { Category, Product, StoreSettings } from '../types/jewelry';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_STORE_SETTINGS,
  MediaRecord,
  normalizeProductFromDoc,
  seedStoreToFirestore,
} from '../services/firestoreStore';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  firestoreSynced: boolean;
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  mediaRecords: MediaRecord[];
  adminPinFromDb: string;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  resendVerificationEmail: () => Promise<void>;
  refreshCurrentUser: () => Promise<User | null>;
  logoutFirebase: () => Promise<void>;
  syncLocalDataToFirebase: (force?: boolean) => Promise<{ seededProducts: number }>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

const BOOTSTRAPPED_ADMIN_EMAIL = 'mando.nawar@gmail.com';
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [firestoreSynced, setFirestoreSynced] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [mediaRecords, setMediaRecords] = useState<MediaRecord[]>([]);
  const [adminPinFromDb, setAdminPinFromDb] = useState<string>('112233');
  const [loading, setLoading] = useState(true);

  const fallbackLoadedRef = useRef(false);
  const autoSeededRef = useRef(false);

  // 1. Validate Firestore connection on initial boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // 2. Listen to Firebase Auth state & resolve admin privilege
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const emailMatches =
        firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL &&
        firebaseUser.emailVerified;

      if (emailMatches) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      if (firebaseUser.emailVerified) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          setIsAdmin(adminDoc.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  // Helper to load legacy local JSON data ONCE if Firestore hasn't been initialized yet
  const loadFallbackIfUnsynced = async () => {
    if (fallbackLoadedRef.current) return;
    fallbackLoadedRef.current = true;
    try {
      const [settingsRes, categoriesRes, productsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);
      const settingsData = await settingsRes.json();
      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();

      if (settingsData.success && settingsData.settings) {
        setSettings((prev) => ({ ...prev, ...settingsData.settings }));
      }
      if (categoriesData.success && Array.isArray(categoriesData.categories)) {
        setCategories(categoriesData.categories);
      }
      if (productsData.success && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      }
    } catch (err) {
      console.error('Fallback store load skipped:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Public real-time Firestore listeners (settings/store, categories, products)
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'store'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFirestoreSynced(true);
          setSettings((prev) => ({
            ...prev,
            storeName: data.storeName || prev.storeName,
            tagline: data.tagline ?? prev.tagline,
            whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            phoneNumber: data.phoneNumber ?? prev.phoneNumber,
            address: data.address ?? prev.address,
            workHours: data.workHours ?? prev.workHours,
            currency: data.currency || prev.currency,
            heroBannerTitle: data.heroBannerTitle ?? prev.heroBannerTitle,
            heroBannerSubtitle: data.heroBannerSubtitle ?? prev.heroBannerSubtitle,
            heroBannerBadge: data.heroBannerBadge ?? prev.heroBannerBadge,
            announcementBar: data.announcementBar ?? prev.announcementBar,
            goldPrices: data.goldPrices || prev.goldPrices,
            priceDisclaimer: data.priceDisclaimer ?? prev.priceDisclaimer,
            autoCalcPrices: Boolean(data.autoCalcPrices),
            hideAllPrices: data.hideAllPrices !== undefined ? Boolean(data.hideAllPrices) : prev.hideAllPrices,
            logoUrl: data.logoUrl || prev.logoUrl,
          }));
          setLoading(false);
        } else {
          setFirestoreSynced(false);
          loadFallbackIfUnsynced();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/store');
      }
    );

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs
            .map((d) => ({ ...(d.data() as Category & { order?: number }), id: d.id }))
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          setCategories(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        // When Firestore store is initialized, products snapshot is authoritative (even if 0 items!)
        // If settings/store doesn't exist yet and snap is empty, fallback will populate temporarily
        setProducts((prev) => {
          if (snap.empty && !fallbackLoadedRef.current) {
            return prev;
          }
          const list = snap.docs.map((d) => normalizeProductFromDoc(d.id, d.data()));
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          return list;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
    };
  }, []);

  // Ensure products clears to 0 if synced in Firestore and Firestore products collection becomes empty
  useEffect(() => {
    if (!firestoreSynced) return;
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const list = snap.docs.map((d) => normalizeProductFromDoc(d.id, d.data()));
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProducts(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );
    return () => unsub();
  }, [firestoreSynced]);

  // 4. Protected Admin-only listeners (media & adminConfig/security)
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setMediaRecords([]);
      return;
    }

    const unsubSecurity = onSnapshot(
      doc(db, 'adminConfig', 'security'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.adminPin) {
            setAdminPinFromDb(String(data.adminPin));
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'adminConfig/security');
      }
    );

    const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubMedia = onSnapshot(
      mediaQuery,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            filename: String(data.filename || ''),
            url: String(data.url || ''),
            size: Number(data.size || 0),
            productCode: data.productCode ? String(data.productCode) : undefined,
            uploadedBy: String(data.uploadedBy || ''),
            createdAt: data.createdAt,
          } as MediaRecord;
        });
        setMediaRecords(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'media');
      }
    );

    return () => {
      unsubSecurity();
      unsubMedia();
    };
  }, [authReady, user, isAdmin]);

  // 5. Auto-seed Firestore once when verified Admin logs in for the first time on an uninitialized DB
  const syncLocalDataToFirebase = async (force = false) => {
    let localSettings = DEFAULT_STORE_SETTINGS;
    let localCategories = DEFAULT_CATEGORIES;
    let localProducts: Product[] = [];

    try {
      const [sRes, cRes, pRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);
      const sData = await sRes.json();
      const cData = await cRes.json();
      const pData = await pRes.json();
      if (sData.success && sData.settings) localSettings = sData.settings;
      if (cData.success && Array.isArray(cData.categories)) localCategories = cData.categories;
      if (pData.success && Array.isArray(pData.products)) localProducts = pData.products;
    } catch {
      // Fallback to in-memory state if API unavailable
      localSettings = settings;
      localCategories = categories;
      localProducts = products;
    }

    return seedStoreToFirestore({
      settings: localSettings,
      categories: localCategories,
      products: localProducts,
      adminPin: localSettings.adminPin || '112233',
      forceOverwriteProducts: force,
    });
  };

  useEffect(() => {
    if (authReady && user && isAdmin && !firestoreSynced && !autoSeededRef.current) {
      autoSeededRef.current = true;
      syncLocalDataToFirebase(false).catch((err) => {
        console.error('Auto seed to Firestore failed:', err);
        autoSeededRef.current = false;
      });
    }
  }, [authReady, user, isAdmin, firestoreSynced]);

  const signInWithGoogle = async (): Promise<User | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const resolveAdminStatus = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setIsAdmin(false);
      return;
    }
    const emailMatches =
      firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL &&
      firebaseUser.emailVerified;
    if (emailMatches) {
      setIsAdmin(true);
      return;
    }
    if (firebaseUser.emailVerified) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(adminDoc.exists());
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    await resolveAdminStatus(result.user);
    return result.user;
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (result.user && !result.user.emailVerified) {
      await sendEmailVerification(result.user).catch(() => {});
    }
    await resolveAdminStatus(result.user);
    return result.user;
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshCurrentUser = async (): Promise<User | null> => {
    if (!auth.currentUser) return null;
    await auth.currentUser.reload();
    const updatedUser = auth.currentUser;
    setUser(updatedUser);
    await resolveAdminStatus(updatedUser);
    return updatedUser;
  };

  const logoutFirebase = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        firestoreSynced,
        settings,
        categories,
        products,
        mediaRecords,
        adminPinFromDb,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        refreshCurrentUser,
        logoutFirebase,
        syncLocalDataToFirebase,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
}
