'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Banknote, CreditCard, Landmark, Building2, Smartphone, Wallet,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Shield, ArrowRightLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface FinancialService {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'exchange' | 'transfer' | 'bank' | 'bills' | 'ewallet';
  image: string;
  location: string;
  hours: string;
  phone: string;
  services: string[];
  servicesEn: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
  new?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterFinancial: FinancialService[] = [
  // صرافين
  {
    id: 'ex1',
    name: 'صرافة الأمانة',
    nameEn: 'Al-Amana Exchange',
    type: 'صرافة',
    typeEn: 'Exchange',
    category: 'exchange',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة الرئيسية',
    hours: '8:00 - 20:00',
    phone: '0999111101',
    services: ['دولار', 'يورو', 'عملات عربية'],
    servicesEn: ['USD', 'EUR', 'Arab Currencies'],
    rating: 4.9,
    reviews: 220,
    featured: true
  },
  {
    id: 'ex2',
    name: 'صرافة النور',
    nameEn: 'Al-Noor Exchange',
    type: 'صرافة',
    typeEn: 'Exchange',
    category: 'exchange',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 19:00',
    phone: '0999111102',
    services: ['تبديل عملات', 'أسعار منافسة'],
    servicesEn: ['Currency Exchange', 'Competitive Rates'],
    rating: 4.7,
    reviews: 165,
    new: true
  },
  {
    id: 'ex3',
    name: 'صرافة القدس',
    nameEn: 'Al-Quds Exchange',
    type: 'صرافة',
    typeEn: 'Exchange',
    category: 'exchange',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '8:00 - 18:00',
    phone: '0999111103',
    services: ['صرافة', 'تحويلات'],
    servicesEn: ['Exchange', 'Transfers'],
    rating: 4.6,
    reviews: 98
  },
  // حوالات
  {
    id: 'tr1',
    name: 'مركز الحوالات السريعة',
    nameEn: 'Quick Transfer Center',
    type: 'حوالات مالية',
    typeEn: 'Money Transfer',
    category: 'transfer',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 19:00',
    phone: '0999222201',
    services: ['ويسترن يونيون', 'مونيغرام', 'تحويلات محلية'],
    servicesEn: ['Western Union', 'MoneyGram', 'Local Transfers'],
    rating: 4.8,
    reviews: 185,
    featured: true
  },
  {
    id: 'tr2',
    name: 'حوالات الشرق',
    nameEn: 'Eastern Transfers',
    type: 'حوالات مالية',
    typeEn: 'Money Transfer',
    category: 'transfer',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '9:00 - 18:00',
    phone: '0999222202',
    services: ['تحويلات دولية', 'تحويلات محلية'],
    servicesEn: ['International', 'Local Transfers'],
    rating: 4.5,
    reviews: 78
  },
  // بنوك
  {
    id: 'bk1',
    name: 'فرع البنك التجاري السوري',
    nameEn: 'Syrian Commercial Bank',
    type: 'بنك',
    typeEn: 'Bank',
    category: 'bank',
    image: 'https://images.unsplash.com/photo-1544876459-7d3a9a43d4e7?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 14:00',
    phone: '0116661111',
    services: ['حسابات', 'قروض', 'ودائع'],
    servicesEn: ['Accounts', 'Loans', 'Deposits'],
    rating: 4.2,
    reviews: 145
  },
  {
    id: 'bk2',
    name: 'فرن البنك العقاري',
    nameEn: 'Real Estate Bank',
    type: 'بنك',
    typeEn: 'Bank',
    category: 'bank',
    image: 'https://images.unsplash.com/photo-1544876459-7d3a9a43d4e7?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '8:00 - 14:00',
    phone: '0116662222',
    services: ['قروض سكنية', 'حسابات'],
    servicesEn: ['Housing Loans', 'Accounts'],
    rating: 4.0,
    reviews: 88
  },
  // دفع فواتير
  {
    id: 'bl1',
    name: 'مركز دفع الفواتير',
    nameEn: 'Bills Payment Center',
    type: 'دفع فواتير',
    typeEn: 'Bills Payment',
    category: 'bills',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 18:00',
    phone: '0999333301',
    services: ['كهرباء', 'مياه', 'هاتف', 'إنترنت'],
    servicesEn: ['Electricity', 'Water', 'Phone', 'Internet'],
    rating: 4.6,
    reviews: 125,
    featured: true
  },
  {
    id: 'bl2',
    name: 'وكالة الدفع الإلكتروني',
    nameEn: 'E-Payment Agency',
    type: 'دفع فواتير',
    typeEn: 'Bills Payment',
    category: 'bills',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '9:00 - 19:00',
    phone: '0999333302',
    services: ['فواتير', 'رسوم', 'ضرائب'],
    servicesEn: ['Bills', 'Fees', 'Taxes'],
    rating: 4.5,
    reviews: 95,
    new: true
  },
  // محافظ إلكترونية
  {
    id: 'ew1',
    name: 'وكيل سيرياتيل كاش',
    nameEn: 'Syriatel Cash Agent',
    type: 'محفظة إلكترونية',
    typeEn: 'E-Wallet',
    category: 'ewallet',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 21:00',
    phone: '0999444401',
    services: ['إيداع', 'سحب', 'تحويل'],
    servicesEn: ['Deposit', 'Withdraw', 'Transfer'],
    rating: 4.7,
    reviews: 180,
    featured: true
  },
  {
    id: 'ew2',
    name: 'وكيل إم تي إن كاش',
    nameEn: 'MTN Cash Agent',
    type: 'محفظة إلكترونية',
    typeEn: 'E-Wallet',
    category: 'ewallet',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '8:00 - 20:00',
    phone: '0999444402',
    services: ['إيداع', 'سحب', 'دفع فواتير'],
    servicesEn: ['Deposit', 'Withdraw', 'Pay Bills'],
    rating: 4.6,
    reviews: 155
  }
];

// بيانات الضاحية
const qudsayaDahiaFinancial: FinancialService[] = [
  // صرافين
  {
    id: 'dex1',
    name: 'صرافة الضاحية',
    nameEn: 'Dahia Exchange',
    type: 'صرافة',
    typeEn: 'Exchange',
    category: 'exchange',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999111104',
    services: ['تبديل عملات', 'دولار', 'يورو'],
    servicesEn: ['Currency Exchange', 'USD', 'EUR'],
    rating: 4.8,
    reviews: 195,
    featured: true
  },
  {
    id: 'dex2',
    name: 'صرافة السلام',
    nameEn: 'Al-Salam Exchange',
    type: 'صرافة',
    typeEn: 'Exchange',
    category: 'exchange',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '9:00 - 19:00',
    phone: '0999111105',
    services: ['عملات', 'أسعار منافسة'],
    servicesEn: ['Currencies', 'Competitive Rates'],
    rating: 4.6,
    reviews: 88
  },
  // حوالات
  {
    id: 'dtr1',
    name: 'مركز الحوالات - الضاحية',
    nameEn: 'Dahia Transfer Center',
    type: 'حوالات مالية',
    typeEn: 'Money Transfer',
    category: 'transfer',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 19:00',
    phone: '0999222203',
    services: ['تحويلات', 'ويسترن يونيون'],
    servicesEn: ['Transfers', 'Western Union'],
    rating: 4.7,
    reviews: 142,
    featured: true
  },
  // دفع فواتير
  {
    id: 'dbl1',
    name: 'مركز الدفع - الضاحية',
    nameEn: 'Dahia Payment Center',
    type: 'دفع فواتير',
    typeEn: 'Bills Payment',
    category: 'bills',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 18:00',
    phone: '0999333303',
    services: ['فواتير', 'رسوم', 'دفع إلكتروني'],
    servicesEn: ['Bills', 'Fees', 'E-Payment'],
    rating: 4.5,
    reviews: 108
  },
  // محافظ إلكترونية
  {
    id: 'dew1',
    name: 'وكيل سيرياتيل - الضاحية',
    nameEn: 'Syriatel Cash - Dahia',
    type: 'محفظة إلكترونية',
    typeEn: 'E-Wallet',
    category: 'ewallet',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المركز التجاري',
    hours: '8:00 - 21:00',
    phone: '0999444403',
    services: ['إيداع', 'سحب', 'تحويل'],
    servicesEn: ['Deposit', 'Withdraw', 'Transfer'],
    rating: 4.6,
    reviews: 165,
    new: true
  },
  {
    id: 'dew2',
    name: 'وكيل إم تي إن - الضاحية',
    nameEn: 'MTN Cash - Dahia',
    type: 'محفظة إلكترونية',
    typeEn: 'E-Wallet',
    category: 'ewallet',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999444404',
    services: ['إيداع', 'سحب', 'فواتير'],
    servicesEn: ['Deposit', 'Withdraw', 'Bills'],
    rating: 4.5,
    reviews: 128
  }
];

const dataByRegion: Record<Region, FinancialService[]> = {
  'qudsaya-center': qudsayaCenterFinancial,
  'qudsaya-dahia': qudsayaDahiaFinancial
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Banknote },
  { id: 'exchange', name: 'صرافين', nameEn: 'Exchange', icon: Banknote },
  { id: 'transfer', name: 'حوالات', nameEn: 'Transfers', icon: ArrowRightLeft },
  { id: 'bank', name: 'بنوك', nameEn: 'Banks', icon: Landmark },
  { id: 'bills', name: 'دفع فواتير', nameEn: 'Bills', icon: CreditCard },
  { id: 'ewallet', name: 'محافظ', nameEn: 'E-Wallets', icon: Wallet },
];

export default function FinancialServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const financial = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredFinancial = financial.filter(f => {
    return activeCategory === 'all' || f.category === activeCategory;
  });

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, [filteredFinancial]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الخدمات المالية' : 'Financial Services'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredFinancial.length} خدمة في ${regionName}` : `${filteredFinancial.length} services in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? financial.length 
              : financial.filter(f => f.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-emerald-200' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Swipe Hint */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredFinancial.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-emerald-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollLeft 
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollRight 
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50 animate-pulse' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)'
            }}
          >
            {filteredFinancial.map((service, index) => {
              const isFavorite = favorites.includes(service.id);
              
              return (
                <div
                  key={service.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={service.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {service.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-gray-900">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {service.new && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          {isArabic ? 'جديد' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="px-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-900">{service.rating}</span>
                      <span className="text-[10px] text-gray-400">({service.reviews})</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? service.name : service.nameEn}
                    </h3>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? service.services : service.servicesEn).slice(0, 3).map((srv, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                          {srv}
                        </span>
                      ))}
                    </div>

                    {/* Location & Hours */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{service.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.hours}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${service.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {isArabic ? 'اتصل الآن' : 'Call Now'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
