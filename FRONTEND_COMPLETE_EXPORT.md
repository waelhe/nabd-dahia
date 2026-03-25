# 🚀 استخراج الواجهة الأمامية الكاملة - نبض الضاحية وقدسيا

## 📊 ملخص المشروع

**اسم المشروع:** nextjs_tailwind_shadcn_ts  
**الإصدار:** 0.2.0  
**تاريخ الاستخراج:** $(date)

---

## 📁 هيكل الملفات

```
src/
├── app/                    # صفحات التطبيق
│   ├── layout.tsx         # التخطيط الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   ├── globals.css        # الأنماط العامة
│   ├── community/         # صفحة المجتمع
│   ├── directory/         # صفحة الدليل
│   ├── emergency/         # صفحة الطوارئ
│   └── market/            # صفحة السوق
├── components/
│   ├── layout/            # مكونات التخطيط (Header, Footer, BottomNav)
│   ├── local/             # المكونات المحلية (42+ مكون)
│   └── ui/                # مكونات واجهة المستخدم (54 مكون)
├── contexts/              # سياقات React (Auth, Cart, Language, Region)
└── hooks/                 # الخطافات المخصصة
```

---

# ═══════════════════════════════════════════════════════════════
# 📦 القسم الأول: معلومات المشروع والتكوينات
# ═══════════════════════════════════════════════════════════════

---

## 📄 المسار: package.json

```json
{
  "name": "nextjs_tailwind_shadcn_ts",
  "version": "0.2.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000 2>&1 | tee dev.log",
    "build": "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/",
    "start": "NODE_ENV=production bun .next/standalone/server.js 2>&1 | tee server.log",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.1.1",
    "@mdxeditor/editor": "^3.39.1",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "6",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@reactuses/core": "^6.0.5",
    "@tanstack/react-query": "^5.82.0",
    "@tanstack/react-table": "^8.21.3",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.23.2",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.525.0",
    "next": "16.1.3",
    "next-auth": "^4.24.11",
    "next-intl": "^4.3.4",
    "next-themes": "^0.4.6",
    "prisma": "6",
    "react": "^19.0.0",
    "react-day-picker": "^9.8.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.60.0",
    "react-markdown": "^10.1.0",
    "react-resizable-panels": "^3.0.3",
    "react-syntax-highlighter": "^15.6.1",
    "recharts": "^2.15.4",
    "sharp": "^0.34.3",
    "sonner": "^2.0.6",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.1.0",
    "vaul": "^1.1.2",
    "z-ai-web-dev-sdk": "^0.0.17",
    "zod": "^4.0.2",
    "zustand": "^5.0.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^3.0.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "bun-types": "^1.3.4",
    "eslint": "^9",
    "eslint-config-next": "^16.1.1",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.3.5",
    "typescript": "^5"
  }
}
```

---

## 📄 المسار: tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
```

---

## 📄 المسار: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

# ═══════════════════════════════════════════════════════════════
# 📦 القسم الثاني: السياقات (Contexts)
# ═══════════════════════════════════════════════════════════════

---

## 📄 المسار: src/contexts/index.ts

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Contexts Index
 * 
 * تصدير جميع الـ Contexts
 */

export { LanguageProvider, useLanguage } from './LanguageContext';
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { RegionProvider, useRegion } from './RegionContext';
export type { Region } from './RegionContext';
```

---

## 📄 المسار: src/contexts/LanguageContext.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Language Context
 * 
 * سياق اللغة للمشروع - يدعم العربية والإنجليزية
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.tourism': 'السياحة',
    'nav.medical': 'العلاج',
    'nav.education': 'الدراسة',
    'nav.business': 'الأعمال',
    'nav.community': 'المجتمع',
    'nav.marketplace': 'السوق',
    'nav.services': 'الخدمات',
    'nav.profile': 'حسابي',
    'nav.dashboard': 'لوحة التحكم',
    'nav.my_bookings': 'حجوزاتي',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'hero.title': 'اكتشف سحر سوريا مع ضيف',
    'hero.subtitle': 'منصة متكاملة للسياحة، العلاج، الدراسة، وفرص الأعمال. خطط لرحلتك القادمة بكل سهولة وأمان.',
    'hero.smart_travel': 'الجيل الجديد من السفر الذكي في سوريا',
    'hero.search': 'بحث',
    'hero.ai_search': 'بحث بذكاء',
    'hero.ai_placeholder': 'أريد فندق رخيص في دمشق القديمة...',
    'hero.destination': 'الوجهة',
    'hero.date': 'التاريخ',
    'hero.guests': 'الضيوف',
    'hero.guest_unit': 'ضيف',
    'hero.guests_unit': 'ضيوف',
    'hero.placeholder': 'إلى أين تريد الذهاب؟',
    'hero.tab.tourism': 'السياحة',
    'hero.tab.medical': 'العلاج',
    'hero.tab.education': 'الدراسة',
    'hero.tab.business': 'الأعمال',
    'hero.tab.ai': 'بحث ذكي',
    'header.anywhere': 'أي مكان',
    'header.any_week': 'أي أسبوع',
    'header.add_guests': 'إضافة ضيوف',
    'header.host': 'استضافة',
    'coming_soon': 'سيتم تفعيل هذه الميزة قريباً',
    'featured.title': 'إقامات وخدمات مميزة',
    'featured.subtitle': 'اكتشف أفضل العروض والخدمات الموصى بها في جميع أنحاء سوريا',
    'featured.view_all': 'عرض الكل',
    'categories.title': 'استكشف حسب الفئة',
    'categories.subtitle': 'اختر الفئة التي تناسب احتياجاتك لتبدأ رحلتك',
    'listing.price_per_night': 'ليلة',
    'listing.reviews': 'تقييم',
    'listing.superhost': 'مضيف متميز',
    'listing.book': 'احجز',
    'listing.amenities': 'المرافق',
    'listing.location': 'الموقع',
    'booking.check_in': 'تسجيل الوصول',
    'booking.check_out': 'تسجيل المغادرة',
    'booking.guests': 'ضيوف',
    'booking.total': 'المجموع',
    'booking.reserve': 'احجز الآن',
    'footer.rights': 'جميع الحقوق محفوظة. دليل سوريا',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.search': 'بحث',
    'common.no_results': 'لا توجد نتائج',
    'common.show_more': 'عرض المزيد',
  },
  en: {
    'nav.home': 'Home',
    'nav.tourism': 'Tourism',
    'nav.medical': 'Medical',
    'nav.education': 'Education',
    'nav.business': 'Business',
    'nav.community': 'Community',
    'nav.marketplace': 'Marketplace',
    'nav.services': 'Services',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.my_bookings': 'My Bookings',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.title': 'Discover the Magic of Syria with Dayf',
    'hero.subtitle': 'A comprehensive platform for tourism, medical, education, and business services.',
    'hero.smart_travel': 'The next generation of smart travel in Syria',
    'hero.search': 'Search',
    'hero.ai_search': 'AI Search',
    'hero.ai_placeholder': 'I want a cheap hotel in Old Damascus...',
    'hero.destination': 'Destination',
    'hero.date': 'Date',
    'hero.guests': 'Guests',
    'hero.guest_unit': 'Guest',
    'hero.guests_unit': 'Guests',
    'hero.placeholder': 'Where do you want to go?',
    'hero.tab.tourism': 'Tourism',
    'hero.tab.medical': 'Medical',
    'hero.tab.education': 'Education',
    'hero.tab.business': 'Business',
    'hero.tab.ai': 'AI Search',
    'header.anywhere': 'Anywhere',
    'header.any_week': 'Any week',
    'header.add_guests': 'Add guests',
    'header.host': 'Host',
    'coming_soon': 'This feature will be available soon',
    'featured.title': 'Featured Stays & Services',
    'featured.subtitle': 'Discover the best recommended offers and services across Syria',
    'featured.view_all': 'View All',
    'categories.title': 'Explore by Category',
    'categories.subtitle': 'Choose the category that fits your needs',
    'listing.price_per_night': 'night',
    'listing.reviews': 'reviews',
    'listing.superhost': 'Superhost',
    'listing.book': 'Book',
    'listing.amenities': 'Amenities',
    'listing.location': 'Location',
    'booking.check_in': 'Check-in',
    'booking.check_out': 'Check-out',
    'booking.guests': 'Guests',
    'booking.total': 'Total',
    'booking.reserve': 'Reserve',
    'footer.rights': 'All rights reserved. Syria Guide',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.no_results': 'No results found',
    'common.show_more': 'Show More',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  const saved = localStorage.getItem('language');
  if (saved === 'ar' || saved === 'en') {
    return saved;
  }
  return 'ar';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
```

---

## 📄 المسار: src/contexts/AuthContext.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Auth Context
 * 
 * سياق المصادقة للمستخدمين
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    router.refresh();
  };

  const signOut = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 📄 المسار: src/contexts/RegionContext.tsx

```tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Region = 'qudsaya-center' | 'qudsaya-dahia';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  regionName: string;
  regionNameEn: string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>('qudsaya-center');

  const regionNames = {
    'qudsaya-center': { ar: 'قدسيا', en: 'Qudsaya' },
    'qudsaya-dahia': { ar: 'ضاحية قدسيا', en: 'Qudsaya Dahia' }
  };

  const value: RegionContextType = {
    region,
    setRegion,
    regionName: regionNames[region].ar,
    regionNameEn: regionNames[region].en
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
```

---

## 📄 المسار: src/contexts/CartContext.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cart Context
 * 
 * سياق سلة التسوق
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);
  const [isOpen, setIsOpen] = useState(false);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.productId === item.productId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        toast.success('تم تحديث الكمية');
        return updated;
      }
      
      toast.success('تمت الإضافة للسلة');
      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('تم الحذف من السلة');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    toast.success('تم تفريغ السلة');
  };

  return (
    <CartContext.Provider value={{
      items,
      cartCount,
      totalPrice,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

---

# ═══════════════════════════════════════════════════════════════
# 📦 القسم الثالث: مكونات التخطيط (Layout)
# ═══════════════════════════════════════════════════════════════

---

## 📄 المسار: src/components/layout/index.ts

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Layout Components Index
 */

export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as BottomNav } from './BottomNav';
```

---

## 📄 المسار: src/components/layout/Header.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Header Component
 * 
 * شريط التنقل العلوي - نبض قدسيا
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, Menu, LogIn, LogOut, Globe, Heart, MapPin, Store, Home, Briefcase, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isArabic = language === 'ar';

  // الأقسام الرئيسية
  const mainSections = [
    { id: 'market', name: 'السوق', nameEn: 'Market', icon: Store },
    { id: 'realestate', name: 'عقارات', nameEn: 'Real Estate', icon: Home },
    { id: 'jobs', name: 'وظائف', nameEn: 'Jobs', icon: Briefcase },
    { id: 'community', name: 'مجتمع', nameEn: 'Community', icon: Users },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">ن</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black text-gray-900">
                {isArabic ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </span>
            </div>
          </Link>

          {/* Main Sections Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{isArabic ? section.name : section.nameEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Location Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {isArabic ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all bg-white"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60]`}>
                  {/* Main Sections - Mobile */}
                  <div className="lg:hidden border-b border-gray-100 pb-2 mb-2">
                    {mainSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Link
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />
                          {isArabic ? section.name : section.nameEn}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {!user ? (
                    <Link 
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full px-4 py-3 text-sm font-medium hover:bg-emerald-50 flex items-center gap-3 text-emerald-600"
                    >
                      <LogIn className="w-4 h-4" />
                      {isArabic ? 'تسجيل الدخول' : 'Login'}
                    </Link>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">
                        {isArabic ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">
                        {isArabic ? 'حجوزاتي' : 'My Bookings'}
                      </Link>
                      <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {isArabic ? 'المفضلة' : 'Favorites'}
                      </Link>
                      <div className="h-[1px] bg-gray-100 my-1" />
                      <button 
                        onClick={() => { signOut(); setIsMenuOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        {isArabic ? 'تسجيل الخروج' : 'Logout'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 📄 المسار: src/components/layout/Footer.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Footer Component
 * 
 * شريط التنقل السفلي - نبض قدسيا
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  const content = {
    ar: {
      about: 'نبض الضاحية وقدسيا - منصتك المحلية لكل ما تحتاجه. صيدليات مناوبة، أطباء، سوق محلي، عقارات، ومجتمع نشط.',
      quickLinks: 'روابط سريعة',
      contact: 'تواصل معنا',
      rights: 'نبض الضاحية وقدسيا - جميع الحقوق محفوظة',
      links: [
        { name: 'الرئيسية', path: '/' },
        { name: 'السوق', path: '/marketplace' },
        { name: 'العقارات', path: '/realestate' },
        { name: 'المجتمع', path: '/community' },
      ],
      services: [
        { name: 'صيدليات مناوبة', path: '/pharmacies' },
        { name: 'أطباء', path: '/doctors' },
        { name: 'خدمات', path: '/services' },
      ],
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
    },
    en: {
      about: 'Nabd Dahia & Qudsaya - Your local platform for everything you need. On-duty pharmacies, doctors, local market, real estate, and active community.',
      quickLinks: 'Quick Links',
      contact: 'Contact Us',
      rights: 'Nabd Dahia & Qudsaya - All rights reserved',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Market', path: '/marketplace' },
        { name: 'Real Estate', path: '/realestate' },
        { name: 'Community', path: '/community' },
      ],
      services: [
        { name: 'On-Duty Pharmacies', path: '/pharmacies' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'Services', path: '/services' },
      ],
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    }
  };

  const t = language === 'ar' ? content.ar : content.en;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-8 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-xl font-black text-white">
                {language === 'ar' ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              {t.about}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {t.links.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </h3>
            <ul className="space-y-2">
              {t.services.map((service) => (
                <li key={service.path}>
                  <Link href={service.path} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-all" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm">{language === 'ar' ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm" dir="ltr">+963 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm">info@nabdqudsaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t.rights}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 📄 المسار: src/components/layout/BottomNav.tsx

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bottom Navigation Component - Airbnb Style (Optimized - No Framer Motion)
 * 
 * شريط التنقل السفلي للموبايل - نبض قدسيا
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Heart, 
  ShoppingBag,
  Phone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  id: string;
  name: string;
  nameEn: string;
  path: string;
  icon: React.ElementType;
  isSpecial?: boolean;
  isTel?: boolean;
  badge?: number;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [activeId, setActiveId] = useState('home');

  const navItems: NavItem[] = [
    {
      id: 'home',
      name: 'الرئيسية',
      nameEn: 'Home',
      path: '/',
      icon: Home,
    },
    {
      id: 'explore',
      name: 'استكشف',
      nameEn: 'Explore',
      path: '/#explore',
      icon: Search,
    },
    {
      id: 'market',
      name: 'السوق',
      nameEn: 'Market',
      path: '/#marketplace',
      icon: ShoppingBag,
      badge: 3,
    },
    {
      id: 'favorites',
      name: 'المفضلة',
      nameEn: 'Favorites',
      path: '/#favorites',
      icon: Heart,
    },
    {
      id: 'emergency',
      name: 'طوارئ',
      nameEn: 'Emergency',
      path: 'tel:112',
      icon: Phone,
      isTel: true,
      isSpecial: true,
    },
  ];

  const handleClick = (id: string) => {
    setActiveId(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Airplane-style background with blur */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Main Navigation */}
        <div className="flex justify-around items-center h-16 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || activeId === item.id;
            
            if (item.isTel) {
              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={() => handleClick(item.id)}
                  className="relative flex flex-col items-center justify-center min-w-[64px] h-full group"
                >
                  {/* Special Emergency Button */}
                  <div className="relative flex items-center justify-center group-active:scale-95 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30">
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-red-600">
                    {isArabic ? item.name : item.nameEn}
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleClick(item.id)}
                className="relative flex flex-col items-center justify-center min-w-[64px] h-full group"
              >
                {/* Active indicator - floating pill */}
                {isActive && (
                  <div className="absolute -top-1 w-10 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300" />
                )}

                {/* Icon with container */}
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm' 
                      : 'group-hover:bg-gray-100'
                    }
                    group-active:scale-90
                  `}
                >
                  <Icon 
                    className={`
                      w-5 h-5 transition-all duration-300
                      ${isActive 
                        ? 'text-emerald-600 stroke-[2.5]' 
                        : 'text-gray-500 group-hover:text-gray-700 stroke-[2]'
                      }
                    `} 
                  />
                  
                  {/* Badge for notifications */}
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span 
                  className={`
                    mt-0.5 text-[10px] font-semibold transition-colors duration-300
                    ${isActive 
                      ? 'text-emerald-600' 
                      : 'text-gray-500 group-hover:text-gray-700'
                    }
                  `}
                >
                  {isArabic ? item.name : item.nameEn}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS Safe Area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
```

---

# ═══════════════════════════════════════════════════════════════
# 📦 القسم الرابع: مكونات واجهة المستخدم الأساسية (UI Core)
# ═══════════════════════════════════════════════════════════════

---

## 📄 المسار: src/components/ui/index.ts

```typescript
/**
 * UI Components Index
 * 
 * تصدير مكونات واجهة المستخدم
 */

export { default as Hero } from './Hero';
export { default as Categories } from './Categories';
export { default as ServiceCard } from './ServiceCard';
export { default as ServiceSection } from './ServiceSection';
export { default as WhyChooseUs } from './WhyChooseUs';

// Types
export type { Listing } from './ServiceCard';
```

---

## 📄 المسار: src/components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

---

## 📄 المسار: src/components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

---

## 📄 المسار: src/components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

---

## 📄 المسار: src/components/ui/Hero.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const isArabic = language === 'ar';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative overflow-hidden pt-14">
      {/* Background Image - Optimized */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545562083-a600704fa487?auto=format&fit=crop&w=1200&q=75"
          alt="Damascus"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/85 via-emerald-800/75 to-emerald-900/90" />
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 md:w-16 lg:w-20 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center border border-white/30">
                <Zap className="w-7 h-7 md:w-9 md:h-9 lg:w-12 lg:h-12 text-yellow-300" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white">
                {isArabic ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </h1>
            </div>
            <p className="text-base md:text-lg lg:text-xl text-white/90">
              {isArabic ? 'كل خدمات منطقتك في مكان واحد' : 'All your neighborhood services in one place'}
            </p>
          </motion.div>

          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm md:text-base lg:text-lg mb-5 md:mb-8"
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-300" />
            <span>{isArabic ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}</span>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl"
          >
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-1.5 md:p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center px-3 md:px-5 py-2 md:py-3">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن خدمة، محل، طبيب...' : 'Search services, shops, doctors...'}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm md:text-base lg:text-lg px-2"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-5 md:px-8 py-2.5 md:py-3 lg:py-4 rounded-lg md:rounded-xl text-sm md:text-base lg:text-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 md:gap-2"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
```

---

# ═══════════════════════════════════════════════════════════════
# 📦 القسم الخامس: الصفحات الرئيسية
# ═══════════════════════════════════════════════════════════════

---

## 📄 المسار: src/app/layout.tsx

```tsx
/**
 * Root Layout - Main application wrapper
 * @version 2.0
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, AuthProvider, CartProvider, RegionProvider } from "@/contexts";
import { Header, Footer, BottomNav } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "نبض الضاحية وقدسيا - خدمات منطقتك في مكان واحد",
  description: "منصة متكاملة لخدمات الضاحية وقدسيا - صيدليات مناوبة، أطباء، سوق محلي، عقارات، ومجتمع. كل ما تحتاجه في مكان واحد.",
  keywords: ["قدسيا", "نبض", "خدمات محلية", "صيدليات", "أطباء", "سوق", "عقارات", "مجتمع", "دمشق", "سوريا", "ضاحية قدسيا"],
  authors: [{ name: "Nabd Dahia & Qudsaya Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "نبض الضاحية وقدسيا - خدمات منطقتك",
    description: "منصة متكاملة لخدمات الضاحية وقدسيا - كل ما تحتاجه في مكان واحد",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <RegionProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <div className="flex-1 pb-20 md:pb-0">
                    {children}
                  </div>
                  <Footer />
                  <BottomNav />
                </div>
                <Toaster />
              </RegionProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

---

## 📄 المسار: src/app/page.tsx

```tsx
import { HomePage } from '@/components/HomePage';

export default function Page() {
  return <HomePage />;
}
```

---

## 📄 المسار: src/app/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --font-sans: "Tajawal", ui-sans-serif, system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Tajawal', ui-sans-serif, system-ui, sans-serif;
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
*::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Fade in animation for cards */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
  opacity: 0;
}

/* Soft pulse animation for active elements */
@keyframes pulseSoft {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
}

.animate-pulse-soft {
  animation: pulseSoft 2s ease-in-out infinite;
}

/* Scale in animation for check marks */
@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}
```

---

# 📊 إحصائيات المشروع

## الملفات المستخرجة:

| القسم | العدد |
|-------|-------|
| التكوينات | 3 |
| السياقات (Contexts) | 5 |
| مكونات Layout | 4 |
| مكونات UI | 54 |
| مكونات Local | 42 |
| صفحات App | 6 |
| **المجموع** | **114+** |

## التقنيات المستخدمة:

- **Framework:** Next.js 16.1.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Library:** Radix UI + Shadcn/UI
- **State Management:** React Context + Zustand
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Database:** Prisma

---

**تم إنشاء هذا الملف تلقائياً بواسطة نظام استخراج الواجهة الأمامية**
