/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Header Component - Yelp Style
 * 
 * شريط التنقل العلوي - نبض الضاحية وقدسيا
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Heart,
  Store,
  Settings,
  PenSquare,
  Briefcase,
  UtensilsCrossed,
  HeartPulse,
  Home,
  Wrench,
  ShoppingBag,
  BriefcaseBusiness,
  CarTaxiFront,
  Newspaper,
  Users,
  Coffee,
  Cake,
  Stethoscope,
  Pill,
  Building,
  Hotel,
  Key,
  Car,
  Fuel,
  Sparkles,
  Shirt,
  GraduationCap,
  Dumbbell,
  Calendar,
  Cloud,
  AlertTriangle,
  Scale,
  Banknote,
  Handshake,
  Package,
  Trophy
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// جميع أقسام الموقع منظمة مع أيقونات وألوان
const CATEGORIES = [
  { 
    id: 'restaurants-cafes', 
    name: 'مطاعم ومقاهي', 
    nameEn: 'Restaurants',
    icon: UtensilsCrossed,
    color: '#FF5A5F',
    subcategories: [
      { id: 'restaurants', name: 'مطاعم', nameEn: 'Restaurants', icon: UtensilsCrossed },
      { id: 'cafes', name: 'مقاهي', nameEn: 'Cafes', icon: Coffee },
      { id: 'sweets', name: 'حلويات', nameEn: 'Sweets', icon: Cake },
      { id: 'fast-food', name: 'وجبات سريعة', nameEn: 'Fast Food', icon: UtensilsCrossed },
    ]
  },
  { 
    id: 'health', 
    name: 'صحة', 
    nameEn: 'Health',
    icon: Stethoscope,
    color: '#E31C5F',
    subcategories: [
      { id: 'doctors', name: 'أطباء', nameEn: 'Doctors', icon: Stethoscope },
      { id: 'pharmacies', name: 'صيدليات', nameEn: 'Pharmacies', icon: Pill },
      { id: 'medical-centers', name: 'مراكز طبية', nameEn: 'Medical Centers', icon: HeartPulse },
      { id: 'beauty', name: 'جمال وعناية', nameEn: 'Beauty & Care', icon: Sparkles },
    ]
  },
  { 
    id: 'real-estate', 
    name: 'عقارات', 
    nameEn: 'Real Estate',
    icon: Building,
    color: '#00A699',
    subcategories: [
      { id: 'real-estate', name: 'عقارات', nameEn: 'Real Estate', icon: Building },
      { id: 'hotels', name: 'فنادق', nameEn: 'Hotels', icon: Hotel },
      { id: 'furnished-apartments', name: 'شقق مفروشة', nameEn: 'Furnished Apartments', icon: Key },
    ]
  },
  { 
    id: 'services', 
    name: 'خدمات', 
    nameEn: 'Services',
    icon: Wrench,
    color: '#78716C',
    subcategories: [
      { id: 'craftsmen', name: 'حرفيين', nameEn: 'Craftsmen', icon: Wrench },
      { id: 'car-services', name: 'خدمات سيارات', nameEn: 'Car Services', icon: Car },
      { id: 'laundry', name: 'مغاسل', nameEn: 'Laundry', icon: Shirt },
      { id: 'event-services', name: 'خدمات مناسبات', nameEn: 'Event Services', icon: Calendar },
    ]
  },
  { 
    id: 'markets', 
    name: 'أسواق', 
    nameEn: 'Markets',
    icon: ShoppingBag,
    color: '#FC642D',
    subcategories: [
      { id: 'markets', name: 'أسواق', nameEn: 'Markets', icon: ShoppingBag },
      { id: 'retail-shops', name: 'محلات تجارية', nameEn: 'Retail Shops', icon: ShoppingBag },
      { id: 'used-items', name: 'مستعمل', nameEn: 'Used Items', icon: Handshake },
      { id: 'classifieds', name: 'إعلانات مبوبة', nameEn: 'Classifieds', icon: Newspaper },
    ]
  },
  { 
    id: 'business', 
    name: 'أعمال', 
    nameEn: 'Business',
    icon: Briefcase,
    color: '#6366F1',
    subcategories: [
      { id: 'offices', name: 'مكاتب', nameEn: 'Offices', icon: Building },
      { id: 'professionals', name: 'مهنيين', nameEn: 'Professionals', icon: Briefcase },
      { id: 'financial-services', name: 'خدمات مالية', nameEn: 'Financial Services', icon: Banknote },
      { id: 'legal', name: 'خدمات قانونية', nameEn: 'Legal Services', icon: Scale },
    ]
  },
  { 
    id: 'jobs', 
    name: 'وظائف', 
    nameEn: 'Jobs',
    icon: Briefcase,
    color: '#428BFF',
    subcategories: [
      { id: 'jobs', name: 'وظائف شاغرة', nameEn: 'Job Openings', icon: Briefcase },
      { id: 'education', name: 'تعليم', nameEn: 'Education', icon: GraduationCap },
    ]
  },
  { 
    id: 'transport', 
    name: 'نقل', 
    nameEn: 'Transport',
    icon: Car,
    color: '#428BFF',
    subcategories: [
      { id: 'transport', name: 'نقل ومواصلات', nameEn: 'Transport', icon: CarTaxiFront },
      { id: 'gas-stations', name: 'محطات وقود', nameEn: 'Gas Stations', icon: Fuel },
    ]
  },
  { 
    id: 'community', 
    name: 'مجتمع', 
    nameEn: 'Community',
    icon: Users,
    color: '#D939A0',
    subcategories: [
      { id: 'community', name: 'مجتمع', nameEn: 'Community', icon: Users },
      { id: 'charity', name: 'خيرية', nameEn: 'Charity', icon: Heart },
      { id: 'events', name: 'فعاليات', nameEn: 'Events', icon: Calendar },
      { id: 'sports', name: 'رياضة', nameEn: 'Sports', icon: Dumbbell },
    ]
  },
  { 
    id: 'info', 
    name: 'معلومات', 
    nameEn: 'Info',
    icon: Newspaper,
    subcategories: [
      { id: 'prayer-times', name: 'أوقات الصلاة', nameEn: 'Prayer Times', icon: Newspaper },
      { id: 'weather', name: 'الطقس', nameEn: 'Weather', icon: Cloud },
      { id: 'market-prices', name: 'أسعار السوق', nameEn: 'Market Prices', icon: Banknote },
      { id: 'emergency-contacts', name: 'طوارئ', nameEn: 'Emergency', icon: AlertTriangle },
    ]
  },
];

const LOCATIONS = [
  { id: 'qudsaya', name: 'قدسيا', nameEn: 'Qudsaya' },
  { id: 'dahia', name: 'الضاحية', nameEn: 'Dahia' },
  { id: 'dimas', name: 'الديماس', nameEn: 'Dimas' },
  { id: 'all', name: 'كل المناطق', nameEn: 'All Areas' },
];

export default function Header() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('qudsaya');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryPosition, setCategoryPosition] = useState({ left: 0, width: 0, right: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  
  const isArabic = language === 'ar';

  // فحص إمكانية التمرير
  const checkScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // تمرير شريط الفئات
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      // إغلاق القائمة المنسدلة عند التمرير على الجوال
      if (window.innerWidth < 768 && hoveredCategory) {
        setHoveredCategory(null);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredCategory]);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      // إغلاق القائمة المنسدلة عند النقر خارجها (على جميع الشاشات)
      if (hoveredCategory) {
        const dropdown = document.getElementById('category-dropdown');
        const clickedElement = event.target as HTMLElement;
        // إغلاق إذا لم يكن النقر على القائمة أو على زر الفئة
        if (dropdown && !dropdown.contains(event.target as Node) && !clickedElement.closest('[data-category-button]')) {
          setHoveredCategory(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCategory]);

  // تحديث موقع القائمة المنسدلة
  useEffect(() => {
    if (hoveredCategory && categoryRefs.current[hoveredCategory]) {
      const element = categoryRefs.current[hoveredCategory];
      if (element) {
        const rect = element.getBoundingClientRect();
        setCategoryPosition({
          left: rect.left,
          width: rect.width,
          right: window.innerWidth - rect.right
        });
      }
    }
  }, [hoveredCategory]);

  // إغلاق القائمة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      // يمكن إضافة منطق هنا إذا لزم الأمر
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}&location=${selectedLocation}`);
    }
  };

  const currentLocation = LOCATIONS.find(l => l.id === selectedLocation) || LOCATIONS[0];
  const currentCategory = CATEGORIES.find(c => c.id === hoveredCategory);

  // حساب موقع القائمة - تتوسط الشاشة على الجوال
  const getDropdownStyle = () => {
    const dropdownWidth = 300;
    const padding = 16;
    
    // على الشاشات الكبيرة - تظهر تحت العنصر
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return {
        left: `${categoryPosition.left}px`,
        top: '94px',
      };
    }
    
    // على الجوال - تتوسط الشاشة
    return {
      left: `${padding}px`,
      right: `${padding}px`,
      top: '94px',
    };
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      
      {/* الهيدر الرئيسي - Yelp Style */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-2xl font-bold text-red-500">
                {isArabic ? 'نبض' : 'Nabd'}
              </span>
            </Link>

            {/* Search Bar - Desktop (Yelp Style) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-2xl mx-6">
              <div className="flex items-center w-full border border-gray-300 rounded-full overflow-hidden focus-within:border-gray-500 transition-colors bg-white shadow-sm">
                
                {/* حقل البحث */}
                <div className="flex-1 flex items-center">
                  <Search className="w-5 h-5 text-gray-400 mr-3 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isArabic ? "مطاعم، أطباء، خدمات..." : "restaurants, doctors, services..."}
                    className="flex-1 py-2.5 pr-2 pl-0 text-sm outline-none bg-white"
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* فاصل */}
                <div className="w-px h-6 bg-gray-300" />

                {/* اختيار الموقع */}
                <div className="relative" ref={locationRef}>
                  <button
                    type="button"
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{isArabic ? currentLocation.name : currentLocation.nameEn}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isLocationOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc.id);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 ${
                            selectedLocation === loc.id ? 'text-red-500 bg-red-50' : 'text-gray-700'
                          }`}
                        >
                          {isArabic ? loc.name : loc.nameEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Actions - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/write-review"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                <span>{isArabic ? 'اكتب تقييم' : 'Write a Review'}</span>
              </Link>

              <Link
                href="/business"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>{isArabic ? 'للأعمال' : 'For Businesses'}</span>
              </Link>

              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(user.firstName?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {isArabic ? 'تسجيل الدخول' : 'Log In'}
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                    >
                      {isArabic ? 'انضمام' : 'Sign Up'}
                    </Link>
                  </div>
                )}

                {isUserMenuOpen && user && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      {isArabic ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                    
                    <Link href="/favorites" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" />
                      {isArabic ? 'المفضلة' : 'Favorites'}
                    </Link>
                    
                    <Link href="/my-listings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Store className="w-4 h-4" />
                      {isArabic ? 'إعلاناتي' : 'My Listings'}
                    </Link>
                    
                    <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4" />
                      {isArabic ? 'الإعدادات' : 'Settings'}
                    </Link>
                    
                    <div className="h-[1px] bg-gray-100 my-2" />
                    
                    <button onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      {isArabic ? 'تسجيل الخروج' : 'Log Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Mobile (Yelp Style) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => router.push('/search')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Search className="w-6 h-6" />
              </button>

              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(user.firstName?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    {isArabic ? 'انضمام' : 'Sign Up'}
                  </Link>
                )}

                {isUserMenuOpen && user && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      {isArabic ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                    
                    <Link href="/favorites" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" />
                      {isArabic ? 'المفضلة' : 'Favorites'}
                    </Link>
                    
                    <Link href="/write-review" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <PenSquare className="w-4 h-4" />
                      {isArabic ? 'اكتب تقييم' : 'Write a Review'}
                    </Link>
                    
                    <div className="h-[1px] bg-gray-100 my-2" />
                    
                    <button onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      {isArabic ? 'تسجيل الخروج' : 'Log Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط الفئات */}
      <div 
        className="border-b border-gray-200 bg-white"
        onClick={() => {
          // إغلاق القائمة عند النقر على الشريط نفسه (وليس على زر فئة)
          if (hoveredCategory) {
            setHoveredCategory(null);
          }
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="relative flex items-center py-3">
            {/* سهم التمرير لليسار */}
            {canScrollLeft && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollCategories('left');
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* الفئات القابلة للتمرير */}
            <div
              ref={categoryScrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = hoveredCategory === category.id;
                return (
                  <div 
                    key={category.id}
                    ref={(el) => { categoryRefs.current[category.id] = el; }}
                    className="relative shrink-0"
                    onMouseEnter={() => {
                      if (window.innerWidth >= 768) {
                        setHoveredCategory(category.id);
                      }
                    }}
                    onMouseLeave={() => {
                      if (window.innerWidth >= 768) {
                        setHoveredCategory(null);
                      }
                    }}
                  >
                    <button 
                      data-category-button={category.id}
                      onClick={(e) => {
                        e.stopPropagation(); // منع انتشار الحدث للشريط
                        // تبديل حالة القسم - فتح/إغلاق
                        setHoveredCategory(prev => prev === category.id ? null : category.id);
                      }}
                      className="flex flex-col items-center gap-1 px-3 sm:px-4 py-1.5 min-w-[60px] sm:min-w-[72px] group"
                    >
                      {/* الأيقونة الملونة */}
                      <Icon 
                        className="w-6 h-6 sm:w-6 sm:h-6 transition-all duration-200"
                        style={{ 
                          color: isSelected ? '#111' : category.color,
                          opacity: isSelected ? 1 : 0.75,
                          strokeWidth: isSelected ? 2.5 : 2
                        }}
                      />
                      {/* النص */}
                      <span className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                        isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {isArabic ? category.name : category.nameEn}
                      </span>
                      {/* مؤشر التحديد */}
                      <div className={`h-0.5 w-4 sm:w-5 rounded-full transition-all ${
                        isSelected ? 'bg-gray-900' : 'bg-transparent'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* سهم التمرير لليمين */}
            {canScrollRight && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollCategories('right');
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-all"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* القائمة المنسدلة */}
      {hoveredCategory && currentCategory && (
        <div 
          id="category-dropdown"
          className="fixed z-[60]"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            top: '130px', // أسفل الشريط مباشرة
          }}
          onMouseEnter={() => {
            if (window.innerWidth >= 768) {
              setHoveredCategory(hoveredCategory);
            }
          }}
          onMouseLeave={() => {
            if (window.innerWidth >= 768) {
              setHoveredCategory(null);
            }
          }}
        >
          {/* الخط الأحمر العلوي */}
          <div className="h-[3px] bg-red-500 rounded-t-sm w-full" />
          
          {/* محتوى القائمة */}
          <div className="bg-white rounded-b-lg shadow-2xl border border-gray-200 border-t-0 p-4 w-[320px] sm:w-[360px]">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {currentCategory.subcategories.map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.id}
                    href={`/${sub.id}`}
                    onClick={() => setHoveredCategory(null)}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:text-red-500 hover:bg-red-50 rounded transition-colors group"
                  >
                    <SubIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
                    <span>{isArabic ? sub.name : sub.nameEn}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
