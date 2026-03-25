'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shirt, Sparkles, Sofa, BedDouble, Footprints,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Truck, Clock4
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface LaundryService {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'laundry' | 'dryclean' | 'carpet' | 'furniture' | 'shoes';
  image: string;
  location: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  services: string[];
  servicesEn: string[];
  delivery?: boolean;
  express?: boolean;
  rating: number;
  reviews: number;
  price?: string;
  featured?: boolean;
  new?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterLaundry: LaundryService[] = [
  // مغاسل ملابس
  {
    id: 'l1',
    name: 'مغسلة الملابس النظيفة',
    nameEn: 'Clean Clothes Laundry',
    type: 'مغسلة ملابس',
    typeEn: 'Laundry',
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999111101',
    whatsapp: '0999111101',
    services: ['غسيل', 'كي', 'طي'],
    servicesEn: ['Washing', 'Ironing', 'Folding'],
    delivery: true,
    express: true,
    rating: 4.9,
    reviews: 195,
    price: '500 - 3000',
    featured: true
  },
  {
    id: 'l2',
    name: 'مغسلة الأناقة',
    nameEn: 'Elegance Laundry',
    type: 'مغسلة ملابس',
    typeEn: 'Laundry',
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '8:00 - 19:00',
    phone: '0999111102',
    services: ['غسيل', 'كي'],
    servicesEn: ['Washing', 'Ironing'],
    delivery: true,
    rating: 4.7,
    reviews: 145,
    new: true
  },
  {
    id: 'l3',
    name: 'مغسلة السرعة',
    nameEn: 'Speed Laundry',
    type: 'مغسلة ملابس',
    typeEn: 'Laundry',
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '7:00 - 21:00',
    phone: '0999111103',
    services: ['غسيل سريع', 'express'],
    servicesEn: ['Quick Wash', 'Express'],
    delivery: true,
    express: true,
    rating: 4.6,
    reviews: 88
  },
  // تنظيف جاف
  {
    id: 'd1',
    name: 'التنظيف الجاف الفاخر',
    nameEn: 'Luxury Dry Clean',
    type: 'تنظيف جاف',
    typeEn: 'Dry Clean',
    category: 'dryclean',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999222201',
    services: ['بدلات', 'فساتين', 'سترات'],
    servicesEn: ['Suits', 'Dresses', 'Jackets'],
    delivery: true,
    rating: 4.8,
    reviews: 165,
    price: '1000 - 5000',
    featured: true
  },
  {
    id: 'd2',
    name: 'النظافة الدقيقة',
    nameEn: 'Perfect Clean',
    type: 'تنظيف جاف',
    typeEn: 'Dry Clean',
    category: 'dryclean',
    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '9:00 - 18:00',
    phone: '0999222202',
    services: ['تنظيف جاف', 'كي'],
    servicesEn: ['Dry Clean', 'Ironing'],
    rating: 4.6,
    reviews: 95
  },
  // سجاد وموكيت
  {
    id: 'c1',
    name: 'مغسلة السجاد الشامل',
    nameEn: 'Comprehensive Carpet Wash',
    type: 'تنظيف سجاد',
    typeEn: 'Carpet Cleaning',
    category: 'carpet',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المنطقة الصناعية',
    hours: '8:00 - 17:00',
    phone: '0999333301',
    services: ['سجاد', 'موكيت', 'أرضيات'],
    servicesEn: ['Carpets', 'Rugs', 'Floors'],
    delivery: true,
    rating: 4.7,
    reviews: 125,
    featured: true
  },
  {
    id: 'c2',
    name: 'نظافة السجاد',
    nameEn: 'Carpet Clean',
    type: 'تنظيف سجاد',
    typeEn: 'Carpet Cleaning',
    category: 'carpet',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 16:00',
    phone: '0999333302',
    services: ['غسيل سجاد', 'تجفيف'],
    servicesEn: ['Carpet Wash', 'Drying'],
    rating: 4.5,
    reviews: 72
  },
  // مفروشات
  {
    id: 'f1',
    name: 'تنظيف المفروشات',
    nameEn: 'Furniture Cleaning',
    type: 'تنظيف مفروشات',
    typeEn: 'Furniture Cleaning',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '8:00 - 17:00',
    phone: '0999444401',
    services: ['كنب', 'مراتب', 'ستائر'],
    servicesEn: ['Sofas', 'Mattresses', 'Curtains'],
    delivery: false,
    rating: 4.6,
    reviews: 85,
    new: true
  },
  {
    id: 'f2',
    name: 'نظافة المنازل',
    nameEn: 'Home Clean',
    type: 'تنظيف مفروشات',
    typeEn: 'Furniture Cleaning',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 16:00',
    phone: '0999444402',
    services: ['كنب', 'سجاد', 'ستائر'],
    servicesEn: ['Sofas', 'Carpets', 'Curtains'],
    rating: 4.4,
    reviews: 58
  },
  // أحذية
  {
    id: 's1',
    name: 'تنظيف الأحذية',
    nameEn: 'Shoes Cleaning',
    type: 'تنظيف أحذية',
    typeEn: 'Shoes Cleaning',
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999555501',
    services: ['تنظيف', 'صبغ', 'إصلاح'],
    servicesEn: ['Cleaning', 'Dyeing', 'Repair'],
    rating: 4.7,
    reviews: 95,
    featured: true
  },
  {
    id: 's2',
    name: 'العناية بالأحذية',
    nameEn: 'Shoes Care',
    type: 'تنظيف أحذية',
    typeEn: 'Shoes Cleaning',
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '10:00 - 18:00',
    phone: '0999555502',
    services: ['تنظيف', 'تلميع'],
    servicesEn: ['Cleaning', 'Polishing'],
    rating: 4.5,
    reviews: 65
  }
];

// بيانات الضاحية
const qudsayaDahiaLaundry: LaundryService[] = [
  // مغاسل ملابس
  {
    id: 'dl1',
    name: 'مغسلة الضاحية',
    nameEn: 'Dahia Laundry',
    type: 'مغسلة ملابس',
    typeEn: 'Laundry',
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999111104',
    services: ['غسيل', 'كي', 'توصيل'],
    servicesEn: ['Washing', 'Ironing', 'Delivery'],
    delivery: true,
    express: true,
    rating: 4.8,
    reviews: 175,
    featured: true
  },
  {
    id: 'dl2',
    name: 'مغسلة النظافة',
    nameEn: 'Clean Laundry',
    type: 'مغسلة ملابس',
    typeEn: 'Laundry',
    category: 'laundry',
    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '8:00 - 19:00',
    phone: '0999111105',
    services: ['غسيل', 'كي'],
    servicesEn: ['Washing', 'Ironing'],
    delivery: true,
    rating: 4.6,
    reviews: 128
  },
  // تنظيف جاف
  {
    id: 'dd1',
    name: 'التنظيف الجاف - الضاحية',
    nameEn: 'Dry Clean - Dahia',
    type: 'تنظيف جاف',
    typeEn: 'Dry Clean',
    category: 'dryclean',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999222203',
    services: ['بدلات', 'فساتين'],
    servicesEn: ['Suits', 'Dresses'],
    delivery: true,
    rating: 4.7,
    reviews: 142,
    new: true
  },
  // سجاد
  {
    id: 'dc1',
    name: 'مغسلة السجاد - الضاحية',
    nameEn: 'Carpet Wash - Dahia',
    type: 'تنظيف سجاد',
    typeEn: 'Carpet Cleaning',
    category: 'carpet',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المنطقة الصناعية',
    hours: '8:00 - 17:00',
    phone: '0999333303',
    services: ['سجاد', 'موكيت'],
    servicesEn: ['Carpets', 'Rugs'],
    delivery: true,
    rating: 4.6,
    reviews: 98
  },
  // مفروشات
  {
    id: 'df1',
    name: 'تنظيف المفروشات - الضاحية',
    nameEn: 'Furniture - Dahia',
    type: 'تنظيف مفروشات',
    typeEn: 'Furniture Cleaning',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 17:00',
    phone: '0999444403',
    services: ['كنب', 'مراتب'],
    servicesEn: ['Sofas', 'Mattresses'],
    rating: 4.5,
    reviews: 72
  },
  // أحذية
  {
    id: 'ds1',
    name: 'تنظيف الأحذية - الضاحية',
    nameEn: 'Shoes - Dahia',
    type: 'تنظيف أحذية',
    typeEn: 'Shoes Cleaning',
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 19:00',
    phone: '0999555503',
    services: ['تنظيف', 'صبغ'],
    servicesEn: ['Cleaning', 'Dyeing'],
    rating: 4.6,
    reviews: 68
  }
];

const dataByRegion: Record<Region, LaundryService[]> = {
  'qudsaya-center': qudsayaCenterLaundry,
  'qudsaya-dahia': qudsayaDahiaLaundry
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Shirt },
  { id: 'laundry', name: 'مغاسل', nameEn: 'Laundry', icon: Shirt },
  { id: 'dryclean', name: 'تنظيف جاف', nameEn: 'Dry Clean', icon: Sparkles },
  { id: 'carpet', name: 'سجاد', nameEn: 'Carpets', icon: Sofa },
  { id: 'furniture', name: 'مفروشات', nameEn: 'Furniture', icon: BedDouble },
  { id: 'shoes', name: 'أحذية', nameEn: 'Shoes', icon: Footprints },
];

export default function LaundryServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const laundry = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLaundry = laundry.filter(l => {
    return activeCategory === 'all' || l.category === activeCategory;
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
  }, [filteredLaundry]);

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
    <section className="py-4 bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg shadow-cyan-200">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'خدمات الغسيل' : 'Laundry Services'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredLaundry.length} خدمة في ${regionName}` : `${filteredLaundry.length} services in ${regionName}`}
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
              ? laundry.length 
              : laundry.filter(l => l.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-cyan-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredLaundry.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-cyan-500 w-4' : 'bg-gray-300'
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
            {filteredLaundry.map((service, index) => {
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
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-600 text-white">
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {service.delivery && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                          <Truck className="w-2.5 h-2.5" />
                          {isArabic ? 'توصيل' : 'Delivery'}
                        </span>
                      )}
                      {service.express && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-orange-500 text-white flex items-center gap-0.5">
                          <Clock4 className="w-2.5 h-2.5" />
                          {isArabic ? 'سريع' : 'Express'}
                        </span>
                      )}
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
                    {/* Rating & Price */}
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-900">{service.rating}</span>
                        <span className="text-[10px] text-gray-400">({service.reviews})</span>
                      </div>
                      {service.price && (
                        <span className="text-[10px] text-gray-500">{service.price} ل.س</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? service.name : service.nameEn}
                    </h3>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? service.services : service.servicesEn).slice(0, 3).map((srv, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">
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
                      className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
