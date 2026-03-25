'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Store, Shirt, Wrench, Nut, Coffee, Milk, Smartphone, SprayCan, 
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Truck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface RetailShop {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'clothes' | 'hardware' | 'roastery' | 'grocery' | 'electronics' | 'cleaning';
  image: string;
  location: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  delivery?: boolean;
  rating: number;
  reviews: number;
  featured?: boolean;
  new?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterShops: RetailShop[] = [
  // ألبسة
  {
    id: 'c1',
    name: 'محلات الأناقة للملابس',
    nameEn: 'Elegance Clothing Store',
    type: 'ملابس رجالية',
    typeEn: 'Men\'s Clothing',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة الرئيسية',
    hours: '9:00 - 22:00',
    phone: '0999123456',
    whatsapp: '0999123456',
    delivery: true,
    rating: 4.8,
    reviews: 120,
    featured: true
  },
  {
    id: 'c2',
    name: 'بيت الأزياء',
    nameEn: 'Fashion House',
    type: 'ملابس نسائية',
    typeEn: 'Women\'s Clothing',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع المغتربين',
    hours: '10:00 - 21:00',
    phone: '0998234567',
    delivery: true,
    rating: 4.7,
    reviews: 95,
    new: true
  },
  {
    id: 'c3',
    name: 'ملابس الأطفال',
    nameEn: 'Kids Clothing',
    type: 'ملابس أطفال',
    typeEn: 'Kids Clothing',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '9:00 - 20:00',
    phone: '0997345678',
    rating: 4.6,
    reviews: 78
  },
  // خرداوات
  {
    id: 'h1',
    name: 'محل الخرداوات الشامل',
    nameEn: 'General Hardware Store',
    type: 'خرداوات وأدوات',
    typeEn: 'Hardware & Tools',
    category: 'hardware',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '7:00 - 19:00',
    phone: '0999456789',
    rating: 4.5,
    reviews: 65,
    featured: true
  },
  {
    id: 'h2',
    name: 'محل الحدادة',
    nameEn: 'Iron Works Shop',
    type: 'حدادة',
    typeEn: 'Blacksmith',
    category: 'hardware',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المنطقة الصناعية',
    hours: '8:00 - 18:00',
    phone: '0998567890',
    rating: 4.4,
    reviews: 45
  },
  // محامص
  {
    id: 'r1',
    name: 'محمصة السلطان',
    nameEn: 'Sultan Roastery',
    type: 'مكسرات وبذور',
    typeEn: 'Nuts & Seeds',
    category: 'roastery',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 22:00',
    phone: '0999678901',
    delivery: true,
    rating: 4.9,
    reviews: 180,
    featured: true
  },
  {
    id: 'r2',
    name: 'محمصة اللوز الذهبي',
    nameEn: 'Golden Almond Roastery',
    type: 'حلويات شرقية',
    typeEn: 'Eastern Sweets',
    category: 'roastery',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 23:00',
    phone: '0999789012',
    delivery: true,
    rating: 4.8,
    reviews: 145,
    new: true
  },
  // غذائية
  {
    id: 'g1',
    name: 'محل الأجبان والزيتون',
    nameEn: 'Cheese & Olive Shop',
    type: 'أجبان وزيتون',
    typeEn: 'Cheese & Olives',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '6:00 - 14:00',
    phone: '0999890123',
    rating: 4.7,
    reviews: 110,
    featured: true
  },
  {
    id: 'g2',
    name: 'محل البهارات والعطارة',
    nameEn: 'Spices & Herbs Shop',
    type: 'بهارات وعطارة',
    typeEn: 'Spices & Herbs',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - السوق الشعبي',
    hours: '7:00 - 15:00',
    phone: '0999901234',
    rating: 4.6,
    reviews: 88
  },
  {
    id: 'g3',
    name: 'محل المعلبات',
    nameEn: 'Canned Foods Store',
    type: 'معلبات',
    typeEn: 'Canned Foods',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '8:00 - 20:00',
    phone: '0999012345',
    delivery: true,
    rating: 4.5,
    reviews: 72
  },
  // إلكترونيات
  {
    id: 'e1',
    name: 'محل الهواتف الذكية',
    nameEn: 'Smart Phones Shop',
    type: 'هواتف ذكية',
    typeEn: 'Smart Phones',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الشارع الرئيسي',
    hours: '9:00 - 21:00',
    phone: '0999123457',
    delivery: true,
    rating: 4.7,
    reviews: 130,
    featured: true
  },
  {
    id: 'e2',
    name: 'كمبيوترات وتقنية',
    nameEn: 'Computers & Tech',
    type: 'كمبيوترات',
    typeEn: 'Computers',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 20:00',
    phone: '0999234568',
    rating: 4.6,
    reviews: 95,
    new: true
  },
  // تنظيف
  {
    id: 'cl1',
    name: 'محل المنظفات',
    nameEn: 'Cleaning Supplies',
    type: 'منظفات',
    typeEn: 'Cleaning Products',
    category: 'cleaning',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '8:00 - 19:00',
    phone: '0999345679',
    delivery: true,
    rating: 4.4,
    reviews: 55
  }
];

// بيانات الضاحية
const qudsayaDahiaShops: RetailShop[] = [
  // ألبسة
  {
    id: 'd1',
    name: 'محل الأناقة - الضاحية',
    nameEn: 'Elegance - Dahia',
    type: 'ملابس رجالية',
    typeEn: 'Men\'s Clothing',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 22:00',
    phone: '0999456780',
    delivery: true,
    rating: 4.7,
    reviews: 105,
    featured: true
  },
  {
    id: 'd2',
    name: 'أزياء الحريم',
    nameEn: 'Women\'s Fashion',
    type: 'ملابس نسائية',
    typeEn: 'Women\'s Clothing',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '10:00 - 21:00',
    phone: '0999567891',
    rating: 4.6,
    reviews: 88
  },
  // خرداوات
  {
    id: 'dh1',
    name: 'خرداوات الضاحية',
    nameEn: 'Dahia Hardware',
    type: 'خرداوات وأدوات',
    typeEn: 'Hardware & Tools',
    category: 'hardware',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '7:00 - 19:00',
    phone: '0999678902',
    rating: 4.5,
    reviews: 60,
    featured: true
  },
  // محامص
  {
    id: 'dr1',
    name: 'محمصة النور',
    nameEn: 'Al-Noor Roastery',
    type: 'مكسرات وبذور',
    typeEn: 'Nuts & Seeds',
    category: 'roastery',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 22:00',
    phone: '0999789013',
    delivery: true,
    rating: 4.8,
    reviews: 165,
    featured: true
  },
  // غذائية
  {
    id: 'dg1',
    name: 'محل الألبان الطازجة',
    nameEn: 'Fresh Dairy Shop',
    type: 'أجبان وألبان',
    typeEn: 'Cheese & Dairy',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الشمالي',
    hours: '6:00 - 13:00',
    phone: '0999890124',
    rating: 4.7,
    reviews: 98
  },
  {
    id: 'dg2',
    name: 'بهارات الشرق',
    nameEn: 'Eastern Spices',
    type: 'بهارات وعطارة',
    typeEn: 'Spices & Herbs',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - السوق',
    hours: '7:00 - 15:00',
    phone: '0999901235',
    rating: 4.5,
    reviews: 75
  },
  // إلكترونيات
  {
    id: 'de1',
    name: 'إلكترونيات الضاحية',
    nameEn: 'Dahia Electronics',
    type: 'هواتف وإكسسوارات',
    typeEn: 'Phones & Accessories',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المركز التجاري',
    hours: '9:00 - 21:00',
    phone: '0999012346',
    delivery: true,
    rating: 4.6,
    reviews: 110,
    new: true
  },
  // تنظيف
  {
    id: 'dcl1',
    name: 'مستلزمات التنظيف',
    nameEn: 'Cleaning Supplies',
    type: 'منظفات وتعقيم',
    typeEn: 'Cleaning & Sanitizing',
    category: 'cleaning',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الجنوبي',
    hours: '8:00 - 19:00',
    phone: '0999123458',
    rating: 4.3,
    reviews: 48
  }
];

const dataByRegion: Record<Region, RetailShop[]> = {
  'qudsaya-center': qudsayaCenterShops,
  'qudsaya-dahia': qudsayaDahiaShops
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Store },
  { id: 'clothes', name: 'ألبسة', nameEn: 'Clothing', icon: Shirt },
  { id: 'hardware', name: 'خرداوات', nameEn: 'Hardware', icon: Wrench },
  { id: 'roastery', name: 'محامص', nameEn: 'Roastery', icon: Nut },
  { id: 'grocery', name: 'غذائية', nameEn: 'Grocery', icon: Milk },
  { id: 'electronics', name: 'إلكترونيات', nameEn: 'Electronics', icon: Smartphone },
  { id: 'cleaning', name: 'تنظيف', nameEn: 'Cleaning', icon: SprayCan },
];

export default function RetailShops() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const shops = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredShops = shops.filter(shop => {
    return activeCategory === 'all' || shop.category === activeCategory;
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
  }, [filteredShops]);

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
    <section className="py-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المحلات التجارية' : 'Retail Shops'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredShops.length} محل في ${regionName}` : `${filteredShops.length} shops in ${regionName}`}
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
              ? shops.length 
              : shops.filter(s => s.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-amber-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredShops.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-amber-500 w-4' : 'bg-gray-300'
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
            {filteredShops.map((shop, index) => {
              const isFavorite = favorites.includes(shop.id);
              
              return (
                <div
                  key={shop.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={shop.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(shop.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-600 text-white">
                        {isArabic ? shop.type : shop.typeEn}
                      </span>
                    </div>

                    {/* Featured/New/Delivery Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {shop.delivery && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                          <Truck className="w-2.5 h-2.5" />
                          {isArabic ? 'توصيل' : 'Delivery'}
                        </span>
                      )}
                      {shop.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-gray-900">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {shop.new && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          {isArabic ? 'جديد' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="px-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-900">{shop.rating}</span>
                      <span className="text-[10px] text-gray-400">({shop.reviews})</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? shop.name : shop.nameEn}
                    </h3>

                    {/* Location & Hours */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{shop.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{shop.hours}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${shop.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
