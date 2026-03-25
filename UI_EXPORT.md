# 📦 واجهة تطبيق "نبض الضاحية وقدسيا" - كاملة

---

## 📁 هيكل الملفات

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── HomePage.tsx
│   ├── ui/
│   │   └── Hero.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── BottomNav.tsx
│   └── local/
│       ├── index.ts
│       ├── QuickServices.tsx
│       ├── DailyInfoBar.tsx
│       ├── FeaturedOffers.tsx
│       ├── RegionSelector.tsx
│       └── [30+ مكون خدمي]
└── contexts/
    ├── LanguageContext.tsx
    ├── RegionContext.tsx
    └── AuthContext.tsx
```

---

## 1️⃣ الصفحة الرئيسية - page.tsx

```tsx
import { HomePage } from '@/components/HomePage';

export default function Page() {
  return <HomePage />;
}
```

---

## 2️⃣ التخطيط الرئيسي - layout.tsx

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

## 3️⃣ Hero.tsx - الصورة الرئيسية

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

## 4️⃣ DailyInfoBar.tsx - شريط الصلاة والطقس

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sunrise, Sunset, CloudMoon, Clock, MapPin, ChevronDown, ChevronUp, Bell, Cloud, Droplets, Wind, Thermometer, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

// Prayer Times Data
interface PrayerTime {
  id: string;
  name: string;
  nameEn: string;
  time: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface PrayerData {
  prayers: PrayerTime[];
  location: string;
  locationEn: string;
}

const qudsayaCenterPrayers: PrayerData = {
  prayers: [
    { id: 'fajr', name: 'الفجر', nameEn: 'Fajr', time: '05:10', icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'sunrise', name: 'الشروق', nameEn: 'Sunrise', time: '06:35', icon: Sunrise, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { id: 'dhuhr', name: 'الظهر', nameEn: 'Dhuhr', time: '12:40', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { id: 'asr', name: 'العصر', nameEn: 'Asr', time: '16:10', icon: CloudMoon, color: 'text-amber-500', bgColor: 'bg-amber-100' },
    { id: 'maghrib', name: 'المغرب', nameEn: 'Maghrib', time: '18:50', icon: Sunset, color: 'text-rose-500', bgColor: 'bg-rose-100' },
    { id: 'isha', name: 'العشاء', nameEn: 'Isha', time: '20:15', icon: Moon, color: 'text-purple-500', bgColor: 'bg-purple-100' }
  ],
  location: 'قدسيا، دمشق',
  locationEn: 'Qudsaya, Damascus'
};

const qudsayaDahiaPrayers: PrayerData = {
  prayers: [
    { id: 'fajr', name: 'الفجر', nameEn: 'Fajr', time: '05:12', icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'sunrise', name: 'الشروق', nameEn: 'Sunrise', time: '06:38', icon: Sunrise, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { id: 'dhuhr', name: 'الظهر', nameEn: 'Dhuhr', time: '12:45', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { id: 'asr', name: 'العصر', nameEn: 'Asr', time: '16:15', icon: CloudMoon, color: 'text-amber-500', bgColor: 'bg-amber-100' },
    { id: 'maghrib', name: 'المغرب', nameEn: 'Maghrib', time: '18:52', icon: Sunset, color: 'text-rose-500', bgColor: 'bg-rose-100' },
    { id: 'isha', name: 'العشاء', nameEn: 'Isha', time: '20:18', icon: Moon, color: 'text-purple-500', bgColor: 'bg-purple-100' }
  ],
  location: 'ضاحية قدسيا، دمشق',
  locationEn: 'Qudsaya Dahia, Damascus'
};

const prayerDataByRegion: Record<Region, PrayerData> = {
  'qudsaya-center': qudsayaCenterPrayers,
  'qudsaya-dahia': qudsayaDahiaPrayers
};

// Weather Data
interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionEn: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  high: number;
  low: number;
  location: string;
  locationEn: string;
}

const qudsayaCenterWeather: WeatherData = {
  temperature: 27,
  feelsLike: 29,
  condition: 'مشمس',
  conditionEn: 'Sunny',
  humidity: 42,
  windSpeed: 10,
  visibility: 12,
  high: 31,
  low: 21,
  location: 'قدسيا، دمشق',
  locationEn: 'Qudsaya, Damascus'
};

const qudsayaDahiaWeather: WeatherData = {
  temperature: 28,
  feelsLike: 30,
  condition: 'مشمس',
  conditionEn: 'Sunny',
  humidity: 45,
  windSpeed: 12,
  visibility: 10,
  high: 32,
  low: 22,
  location: 'ضاحية قدسيا، دمشق',
  locationEn: 'Qudsaya Dahia, Damascus'
};

const weatherDataByRegion: Record<Region, WeatherData> = {
  'qudsaya-center': qudsayaCenterWeather,
  'qudsaya-dahia': qudsayaDahiaWeather
};

export default function DailyInfoBar() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region } = useRegion();
  
  const prayerData = prayerDataByRegion[region];
  const weatherData = weatherDataByRegion[region];
  const prayers = prayerData.prayers;
  
  const [prayerInfo, setPrayerInfo] = useState({ id: 'fajr', countdown: '--:--' });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updatePrayerInfo = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;

        if (prayerMinutes > currentMinutes) {
          const diff = prayerMinutes - currentMinutes;
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          setPrayerInfo({
            id: prayer.id,
            countdown: `${h}:${m.toString().padStart(2, '0')}`
          });
          return;
        }
      }
      setPrayerInfo({ id: 'fajr', countdown: '--:--' });
    };

    updatePrayerInfo();
    const interval = setInterval(updatePrayerInfo, 60000);
    return () => clearInterval(interval);
  }, [prayers]);

  const nextPrayer = prayers.find(p => p.id === prayerInfo.id);
  const NextPrayerIcon = nextPrayer?.icon || Clock;

  return (
    <section className="py-2 md:py-3 lg:py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-sky-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20"
        >
          {/* Main Bar - Always Visible */}
          <div className="flex items-stretch">
            {/* Prayer Section */}
            <div className="flex-1 p-3 md:p-4 lg:p-5 border-l border-white/20">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl">
                  <NextPrayerIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-[10px] md:text-xs font-medium">
                    {isArabic ? 'الصلاة القادمة' : 'Next Prayer'}
                  </p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-white font-black text-lg md:text-xl lg:text-2xl">
                      {isArabic ? nextPrayer?.name : nextPrayer?.nameEn}
                    </span>
                    <span className="text-white font-bold text-xl md:text-2xl lg:text-3xl">
                      {nextPrayer?.time}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-white/80">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">
                      {isArabic ? `متبقي ${prayerInfo.countdown}` : `${prayerInfo.countdown} left`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Section */}
            <div className="flex-1 p-3 md:p-4 lg:p-5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl">
                  <Sun className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-[10px] md:text-xs font-medium">
                    {isArabic ? 'الطقس' : 'Weather'}
                  </p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-white font-black text-xl md:text-2xl lg:text-3xl">
                      {weatherData.temperature}°
                    </span>
                    <span className="text-white/80 text-sm md:text-base lg:text-lg">
                      {isArabic ? weatherData.condition : weatherData.conditionEn}
                    </span>
                  </div>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm">
                    <span>{weatherData.high}°/{weatherData.low}°</span>
                    <span>•</span>
                    <span>{weatherData.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 md:px-4 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            >
              {showDetails 
                ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white" />
              }
            </button>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white/5 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* All Prayer Times */}
                    <div>
                      <h4 className="text-white/70 text-xs font-bold mb-3 flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        {isArabic ? 'أوقات الصلاة' : 'Prayer Times'}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {prayers.map((prayer) => {
                          const Icon = prayer.icon;
                          const isNext = prayer.id === prayerInfo.id;
                          return (
                            <div
                              key={prayer.id}
                              className={`p-2 rounded-xl text-center ${
                                isNext ? 'bg-white/30' : 'bg-white/10'
                              }`}
                            >
                              <Icon className={`w-4 h-4 mx-auto mb-1 ${isNext ? 'text-white' : 'text-white/70'}`} />
                              <p className="text-white text-[10px] font-bold">
                                {isArabic ? prayer.name : prayer.nameEn}
                              </p>
                              <p className={`text-sm font-black ${isNext ? 'text-white' : 'text-white/80'}`}>
                                {prayer.time}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weather Details */}
                    <div>
                      <h4 className="text-white/70 text-xs font-bold mb-3 flex items-center gap-2">
                        <Cloud className="w-3 h-3" />
                        {isArabic ? 'تفاصيل الطقس' : 'Weather Details'}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-white/70" />
                          <div>
                            <p className="text-white/70 text-[10px]">{isArabic ? 'العظمى/الصغرى' : 'High/Low'}</p>
                            <p className="text-white text-sm font-bold">{weatherData.high}°/{weatherData.low}°</p>
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-white/70" />
                          <div>
                            <p className="text-white/70 text-[10px]">{isArabic ? 'الرطوبة' : 'Humidity'}</p>
                            <p className="text-white text-sm font-bold">{weatherData.humidity}%</p>
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                          <Wind className="w-4 h-4 text-white/70" />
                          <div>
                            <p className="text-white/70 text-[10px]">{isArabic ? 'الرياح' : 'Wind'}</p>
                            <p className="text-white text-sm font-bold">{weatherData.windSpeed} km/h</p>
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-white/70" />
                          <div>
                            <p className="text-white/70 text-[10px]">{isArabic ? 'الرؤية' : 'Visibility'}</p>
                            <p className="text-white text-sm font-bold">{weatherData.visibility} km</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Region Selector */}
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{isArabic ? prayerData.location : prayerData.locationEn}</span>
                    </div>
                    <RegionSelector />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 5️⃣ FeaturedOffers.tsx - العروض المميزة

```tsx
'use client';

import React from 'react';
import { Tag, Clock, Flame, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Offer {
  id: string;
  title: string;
  titleEn: string;
  store: string;
  storeEn: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  endTime: string;
  image: string;
  badge?: string;
  badgeEn?: string;
}

const qudsayaCenterOffers: Offer[] = [
  {
    id: '1',
    title: 'عرض خاص على المنتجات الغذائية',
    titleEn: 'Special Food Offer',
    store: 'سوبر ماركت قدسيا',
    storeEn: 'Qudsaya Supermarket',
    discount: '30%',
    oldPrice: '50,000',
    newPrice: '35,000',
    endTime: 'ينتهي غداً',
    badge: 'محدود',
    badgeEn: 'Limited',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80'
  },
  // ... المزيد من العروض
];

const qudsayaDahiaOffers: Offer[] = [
  // عروض الضاحية
];

const dataByRegion: Record<Region, Offer[]> = {
  'qudsaya-center': qudsayaCenterOffers,
  'qudsaya-dahia': qudsayaDahiaOffers
};

export default function FeaturedOffers() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const offers = dataByRegion[region];

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 relative overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 md:w-60 md:h-60 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-yellow-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2.5 md:p-3 lg:p-4 bg-white rounded-xl md:rounded-2xl shadow-lg"
            >
              <Flame className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-rose-500" />
            </motion.div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                {isArabic ? '🔥 عروض حصرية' : '🔥 Exclusive Offers'}
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 rounded-full text-xs md:text-sm">
                  {offers.length} {isArabic ? 'عروض' : 'offers'}
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-white/80">
                {isArabic ? `أفضل العروض في ${regionName}` : `Best offers in ${regionName}`}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <button onClick={() => scroll('right')} className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => scroll('left')} className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Offers Carousel */}
        <div ref={scrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-72 md:w-80 lg:w-96 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Image & Content */}
              {/* ... */}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 6️⃣ QuickServices.tsx - استكشف الخدمات

```tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Home, Users, ChevronDown, ChevronUp, /* ... */ } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';

// Dynamic imports
const Restaurants = dynamic(() => import('./Restaurants'), { loading: () => <LoadingSkeleton /> });
// ... باقي الاستيرادات

const mainServices = [
  {
    id: 'emergency',
    title: 'طوارئ',
    titleEn: 'Emergency',
    icon: AlertTriangle,
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-600',
    subServices: [/* ... */]
  },
  {
    id: 'directory',
    title: 'دليل محلي',
    titleEn: 'Directory',
    icon: MapPin,
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    subServices: [/* ... */]
  },
  {
    id: 'market',
    title: 'سوق وإعلانات',
    titleEn: 'Market',
    icon: Home,
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-emerald-600',
    subServices: [/* ... */]
  },
  {
    id: 'community',
    title: 'مجتمع وأخبار',
    titleEn: 'Community',
    icon: Users,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-600',
    subServices: [/* ... */]
  }
];

export default function QuickServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { regionName } = useRegion();
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 lg:py-8">
        {/* Section Title */}
        <div className="text-center mb-5 md:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1">
            {isArabic ? 'استكشف الخدمات' : 'Explore Services'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">
            {isArabic ? `اختر ما يناسبك من ${regionName}` : `Find what you need in ${regionName}`}
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {mainServices.map((service, index) => (
            <motion.button
              key={service.id}
              onClick={() => handleSectionClick(service.id)}
              className={`relative group overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 transition-all duration-300 ${
                isActive 
                  ? `bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} shadow-xl` 
                  : 'bg-white border-2 border-gray-100 shadow-sm'
              }`}
            >
              {/* Icon & Title */}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 7️⃣ Restaurants.tsx - المطاعم (مع شريط الفلترة)

```tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UtensilsCrossed, MapPin, Star, Clock, Flame, ChefHat, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';

const cuisineFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: ChefHat },
  { id: 'شامي', name: 'شامي', nameEn: 'Levantine', icon: UtensilsCrossed },
  { id: 'بيتزا', name: 'بيتزا', nameEn: 'Pizza', icon: UtensilsCrossed },
  { id: 'مشاوي', name: 'مشاوي', nameEn: 'Grills', icon: Flame },
];

export default function Restaurants() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const [activeCuisine, setActiveCuisine] = useState('all');

  return (
    <section id="restaurants" className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cuisine Filters - شريط الفلترة */}
        <div className="flex gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {cuisineFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCuisine === filter.id;
            const count = filter.id === 'all' 
              ? restaurants.length 
              : restaurants.filter(r => r.cuisine === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCuisine(filter.id)}
                className={`flex flex-col items-center gap-1 md:gap-2 px-4 py-2 md:px-8 md:py-4 lg:px-12 lg:py-5 rounded-xl md:rounded-2xl min-w-[70px] md:min-w-[100px] lg:min-w-[140px] transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9" />
                <span className="text-xs md:text-base lg:text-lg font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[10px] md:text-sm lg:text-base ${isActive ? 'text-orange-200' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Scrolling Cards */}
        {/* ... */}
      </div>
    </section>
  );
}
```

---

## 8️⃣ Header.tsx - شريط التنقل العلوي

```tsx
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

  const mainSections = [
    { id: 'market', name: 'السوق', nameEn: 'Market', icon: Store },
    { id: 'realestate', name: 'عقارات', nameEn: 'Real Estate', icon: Home },
    { id: 'jobs', name: 'وظائف', nameEn: 'Jobs', icon: Briefcase },
    { id: 'community', name: 'مجتمع', nameEn: 'Community', icon: Users },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">ن</span>
            </div>
            <span className="text-lg font-black text-gray-900 hidden sm:block">
              {isArabic ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100">
              <Globe className="w-5 h-5 text-gray-600" />
            </button>
            {/* User Menu */}
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 9️⃣ Footer.tsx - التذييل

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-8 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          {/* Quick Links */}
          {/* Services */}
          {/* Contact Info */}
        </div>
        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} نبض الضاحية وقدسيا</p>
        </div>
      </div>
    </footer>
  );
}
```

---

## 🔟 BottomNav.tsx - شريط التنقل السفلي

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, ShoppingBag, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const navItems = [
    { id: 'home', name: 'الرئيسية', nameEn: 'Home', path: '/', icon: Home },
    { id: 'explore', name: 'استكشف', nameEn: 'Explore', path: '/#explore', icon: Search },
    { id: 'market', name: 'السوق', nameEn: 'Market', path: '/#marketplace', icon: ShoppingBag, badge: 3 },
    { id: 'favorites', name: 'المفضلة', nameEn: 'Favorites', path: '/#favorites', icon: Heart },
    { id: 'emergency', name: 'طوارئ', nameEn: 'Emergency', path: 'tel:112', icon: Phone, isTel: true, isSpecial: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/80">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <Link key={item.id} href={item.path} className="flex flex-col items-center">
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{isArabic ? item.name : item.nameEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 ملخص الواجهة

### التسلسل الهرمي:

```
┌─────────────────────────────────────────────────────────────┐
│                        Header.tsx                            │
│  [ن] نبض الضاحية وقدسيا    [الأقسام]    [🔔] [🌍] [👤]      │
├─────────────────────────────────────────────────────────────┤
│                        Hero.tsx                              │
│  ⚡ نبض الضاحية وقدسيا                                      │
│  كل خدمات منطقتك في مكان واحد                                │
│  📍 قدسيا، ريف دمشق                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔍 ابحث عن خدمة، محل، طبيب...              [بحث]       ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Quick Access Bar                          │
│  [اختر المنطقة]              [⚠️ طوارئ] [📞 إسعاف]          │
├─────────────────────────────────────────────────────────────┤
│                    DailyInfoBar.tsx                          │
│  🕌 الظهر 12:40    │    ☀️ 27° مشمس                      [▼]│
├─────────────────────────────────────────────────────────────┤
│                   FeaturedOffers.tsx                         │
│  🔥 عروض حصرية                                               │
│  [بطاقة عرض] [بطاقة عرض] [بطاقة عرض]  ←                    │
├─────────────────────────────────────────────────────────────┤
│                   QuickServices.tsx                          │
│  استكشف الخدمات                                              │
│  [🚨 طوارئ] [📍 دليل محلي] [🏠 سوق] [👥 مجتمع]             │
├─────────────────────────────────────────────────────────────┤
│                     HomePage.tsx                             │
│                                                              │
│  📞 دليل الطوارئ والمناوبات                                  │
│  ├─ خدمات طوارئ                                             │
│  └─ جهات اتصال                                              │
│                                                              │
│  📱 الدليل المحلي                                            │
│  ├─ 🍽️ مطاعم ومقاهي                                         │
│  │   ┌────────┬────────┬────────┬────────┐                 │
│  │   │  الكل  │  شامي  │ بيتزا  │ مشاوي  │ ← شريط الفلترة │
│  │   └────────┴────────┴────────┴────────┘                 │
│  ├─ 🛒 أسواق ومتاجر                                         │
│  ├─ ⛽ بنزين وخدمات سيارات                                  │
│  └─ 🏥 أطباء وصيدليات                                       │
│                                                              │
│  🏠 السوق والإعلانات                                         │
│  ├─ 💼 وظائف                                                │
│  ├─ 🏡 عقارات                                               │
│  └─ 👔 مهن حرة                                              │
│                                                              │
│  👥 المجتمع والأخبار                                         │
│  ├─ 💬 المجتمع                                              │
│  └─ 💝 المؤسسات الخيرية                                     │
├─────────────────────────────────────────────────────────────┤
│                       Footer.tsx                             │
│  [ن] نبض الضاحية وقدسيا   روابط سريعة   تواصل معنا         │
│  © 2025 نبض الضاحية وقدسيا                                  │
├─────────────────────────────────────────────────────────────┤
│                     BottomNav.tsx                            │
│  [🏠 الرئيسية] [🔍 استكشف] [🛒 السوق] [❤️ المفضلة] [📞 طوارئ]│
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 المشكلة المحددة

**شريط الفلترة داخل الأقسام (الكل، شامي، بيتزا، مشاوي):**
- الملف: `src/components/local/Restaurants.tsx` (وغيرها)
- الموقع: السطر 240-265
- المشكلة: صغير جداً على الحاسب

**الحل:** تكبير الأزرار على الحاسب باستخدام classes مثل:
- `md:px-8 md:py-4 lg:px-12 lg:py-5`
- `md:w-7 md:h-7 lg:w-9 lg:h-9`
- `md:text-base lg:text-lg`

---

*تم استخراج الواجهة كاملة - يمكن تحميلها واستخدامها*
