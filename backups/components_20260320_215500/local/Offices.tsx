'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Home, Car, Plane, FileText, Shield,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Office {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'realestate' | 'cars' | 'travel' | 'translation' | 'insurance';
  image: string;
  location: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  services: string[];
  servicesEn: string[];
  rating: number;
  reviews: number;
  verified?: boolean;
  featured?: boolean;
  new?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterOffices: Office[] = [
  // مكاتب عقارية
  {
    id: 're1',
    name: 'مكتب العقارات الذهبي',
    nameEn: 'Golden Real Estate',
    type: 'مكتب عقاري',
    typeEn: 'Real Estate Office',
    category: 'realestate',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999111101',
    whatsapp: '0999111101',
    services: ['بيع', 'إيجار', 'إدارة عقارات'],
    servicesEn: ['Sale', 'Rent', 'Property Management'],
    rating: 4.9,
    reviews: 185,
    verified: true,
    featured: true
  },
  {
    id: 're2',
    name: 'مكتب الأمانة العقاري',
    nameEn: 'Al-Amana Real Estate',
    type: 'مكتب عقاري',
    typeEn: 'Real Estate Office',
    category: 'realestate',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 18:00',
    phone: '0999111102',
    services: ['شقق', 'فلل', 'أراضي'],
    servicesEn: ['Apartments', 'Villas', 'Lands'],
    rating: 4.7,
    reviews: 125,
    verified: true
  },
  {
    id: 're3',
    name: 'مكتب النور للعقارات',
    nameEn: 'Al-Noor Real Estate',
    type: 'مكتب عقاري',
    typeEn: 'Real Estate Office',
    category: 'realestate',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '10:00 - 17:00',
    phone: '0999111103',
    services: ['بيع', 'إيجار'],
    servicesEn: ['Sale', 'Rent'],
    rating: 4.5,
    reviews: 78,
    new: true
  },
  // مكاتب سيارات
  {
    id: 'cr1',
    name: 'معرض السيارات الفاخرة',
    nameEn: 'Luxury Cars Showroom',
    type: 'معرض سيارات',
    typeEn: 'Car Showroom',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '9:00 - 20:00',
    phone: '0999222201',
    services: ['بيع سيارات', 'شراء سيارات', 'تأمين'],
    servicesEn: ['Car Sales', 'Car Purchase', 'Insurance'],
    rating: 4.8,
    reviews: 165,
    verified: true,
    featured: true
  },
  {
    id: 'cr2',
    name: 'مكتب السيارات المستعملة',
    nameEn: 'Used Cars Office',
    type: 'مكتب سيارات',
    typeEn: 'Cars Office',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 18:00',
    phone: '0999222202',
    services: ['سيارات مستعملة', 'توثيق', 'فحص'],
    servicesEn: ['Used Cars', 'Documentation', 'Inspection'],
    rating: 4.5,
    reviews: 95
  },
  // وكالات سفر
  {
    id: 'tv1',
    name: 'وكالة السفر والسياحة',
    nameEn: 'Travel & Tourism Agency',
    type: 'وكالة سفر',
    typeEn: 'Travel Agency',
    category: 'travel',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 18:00',
    phone: '0999333301',
    services: ['حجز طيران', 'فنادق', 'تأشيرات'],
    servicesEn: ['Flight Booking', 'Hotels', 'Visas'],
    rating: 4.7,
    reviews: 145,
    verified: true,
    featured: true
  },
  {
    id: 'tv2',
    name: 'وكالة القدس للسفر',
    nameEn: 'Al-Quds Travel Agency',
    type: 'وكالة سفر',
    typeEn: 'Travel Agency',
    category: 'travel',
    image: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '10:00 - 17:00',
    phone: '0999333302',
    services: ['رحلات', 'حج وعمرة'],
    servicesEn: ['Trips', 'Hajj & Umrah'],
    rating: 4.6,
    reviews: 88
  },
  // ترجمة ومعاملات
  {
    id: 'tr1',
    name: 'مكتب الترجمة والمعاملات',
    nameEn: 'Translation & Transactions',
    type: 'ترجمة ومعاملات',
    typeEn: 'Translation Office',
    category: 'translation',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 17:00',
    phone: '0999444401',
    services: ['ترجمة', 'تصديق', 'معاملات'],
    servicesEn: ['Translation', 'Authentication', 'Transactions'],
    rating: 4.8,
    reviews: 120,
    verified: true,
    featured: true
  },
  {
    id: 'tr2',
    name: 'مكتب الخدمات الحكومية',
    nameEn: 'Government Services Office',
    type: 'معاملات حكومية',
    typeEn: 'Government Transactions',
    category: 'translation',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '9:00 - 15:00',
    phone: '0999444402',
    services: ['استخراج وثائق', 'تجديدات'],
    servicesEn: ['Document Extraction', 'Renewals'],
    rating: 4.5,
    reviews: 72
  },
  // تأمين
  {
    id: 'in1',
    name: 'شركة التأمين الشاملة',
    nameEn: 'Comprehensive Insurance',
    type: 'تأمين',
    typeEn: 'Insurance',
    category: 'insurance',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 17:00',
    phone: '0999555501',
    services: ['تأمين سيارات', 'تأمين صحي', 'تأمين عقارات'],
    servicesEn: ['Car Insurance', 'Health Insurance', 'Property Insurance'],
    rating: 4.6,
    reviews: 105,
    verified: true
  },
  {
    id: 'in2',
    name: 'وكالة التأمين الوطني',
    nameEn: 'National Insurance Agency',
    type: 'تأمين',
    typeEn: 'Insurance',
    category: 'insurance',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 16:00',
    phone: '0999555502',
    services: ['تأمين', 'تجديد بوالص'],
    servicesEn: ['Insurance', 'Policy Renewal'],
    rating: 4.4,
    reviews: 65,
    new: true
  }
];

// بيانات الضاحية
const qudsayaDahiaOffices: Office[] = [
  // مكاتب عقارية
  {
    id: 'dre1',
    name: 'مكتب عقارات الضاحية',
    nameEn: 'Dahia Real Estate',
    type: 'مكتب عقاري',
    typeEn: 'Real Estate Office',
    category: 'realestate',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999111104',
    services: ['بيع', 'إيجار', 'إدارة'],
    servicesEn: ['Sale', 'Rent', 'Management'],
    rating: 4.8,
    reviews: 155,
    verified: true,
    featured: true
  },
  {
    id: 'dre2',
    name: 'مكتب الأمل العقاري',
    nameEn: 'Al-Amal Real Estate',
    type: 'مكتب عقاري',
    typeEn: 'Real Estate Office',
    category: 'realestate',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '9:00 - 18:00',
    phone: '0999111105',
    services: ['شقق', 'محلات'],
    servicesEn: ['Apartments', 'Shops'],
    rating: 4.6,
    reviews: 98
  },
  // مكاتب سيارات
  {
    id: 'dcr1',
    name: 'معرض الضاحية للسيارات',
    nameEn: 'Dahia Cars Showroom',
    type: 'معرض سيارات',
    typeEn: 'Car Showroom',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '9:00 - 20:00',
    phone: '0999222203',
    services: ['بيع', 'شراء', 'تبديل'],
    servicesEn: ['Sale', 'Purchase', 'Exchange'],
    rating: 4.7,
    reviews: 138,
    verified: true,
    featured: true
  },
  // وكالات سفر
  {
    id: 'dtv1',
    name: 'وكالة الضاحية للسفر',
    nameEn: 'Dahia Travel Agency',
    type: 'وكالة سفر',
    typeEn: 'Travel Agency',
    category: 'travel',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 18:00',
    phone: '0999333303',
    services: ['حجز طيران', 'فنادق'],
    servicesEn: ['Flight Booking', 'Hotels'],
    rating: 4.5,
    reviews: 82
  },
  // ترجمة
  {
    id: 'dtr1',
    name: 'مكتب الترجمة - الضاحية',
    nameEn: 'Translation - Dahia',
    type: 'ترجمة ومعاملات',
    typeEn: 'Translation Office',
    category: 'translation',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 17:00',
    phone: '0999444403',
    services: ['ترجمة', 'تصديق'],
    servicesEn: ['Translation', 'Authentication'],
    rating: 4.6,
    reviews: 68
  },
  // تأمين
  {
    id: 'din1',
    name: 'وكالة التأمين - الضاحية',
    nameEn: 'Insurance - Dahia',
    type: 'تأمين',
    typeEn: 'Insurance',
    category: 'insurance',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 16:00',
    phone: '0999555503',
    services: ['تأمين سيارات', 'تأمين صحي'],
    servicesEn: ['Car Insurance', 'Health Insurance'],
    rating: 4.5,
    reviews: 72,
    new: true
  }
];

const dataByRegion: Record<Region, Office[]> = {
  'qudsaya-center': qudsayaCenterOffices,
  'qudsaya-dahia': qudsayaDahiaOffices
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Building2 },
  { id: 'realestate', name: 'عقارات', nameEn: 'Real Estate', icon: Home },
  { id: 'cars', name: 'سيارات', nameEn: 'Cars', icon: Car },
  { id: 'travel', name: 'سفر', nameEn: 'Travel', icon: Plane },
  { id: 'translation', name: 'ترجمة', nameEn: 'Translation', icon: FileText },
  { id: 'insurance', name: 'تأمين', nameEn: 'Insurance', icon: Shield },
];

export default function Offices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const offices = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredOffices = offices.filter(o => {
    return activeCategory === 'all' || o.category === activeCategory;
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
  }, [filteredOffices]);

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
    <section className="py-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg shadow-slate-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المكاتب والوسطاء' : 'Offices & Agents'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredOffices.length} مكتب في ${regionName}` : `${filteredOffices.length} offices in ${regionName}`}
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
              ? offices.length 
              : offices.filter(o => o.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-slate-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredOffices.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-slate-500 w-4' : 'bg-gray-300'
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
            {filteredOffices.map((office, index) => {
              const isFavorite = favorites.includes(office.id);
              
              return (
                <div
                  key={office.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={office.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(office.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-600 text-white">
                        {isArabic ? office.type : office.typeEn}
                      </span>
                    </div>

                    {/* Verified/Featured/New Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {office.verified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </span>
                      )}
                      {office.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-gray-900">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {office.new && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          {isArabic ? 'جديد' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Office Info */}
                  <div className="px-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-900">{office.rating}</span>
                      <span className="text-[10px] text-gray-400">({office.reviews})</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? office.name : office.nameEn}
                    </h3>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? office.services : office.servicesEn).slice(0, 3).map((srv, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                          {srv}
                        </span>
                      ))}
                    </div>

                    {/* Location & Hours */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{office.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{office.hours}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${office.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
