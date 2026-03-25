'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Package, Heart, Clock, MapPin, Percent, ChevronLeft, ChevronRight, Smartphone, Sofa, Car, Laptop, Home, Sparkles } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface UsedItem {
  id: string;
  title: string;
  titleEn: string;
  price: string;
  originalPrice: string;
  condition: string;
  conditionEn: string;
  category: 'electronics' | 'furniture' | 'appliances' | 'sports' | 'clothes' | 'other';
  categoryAr: string;
  categoryEn: string;
  images: string[];
  location: string;
  time: string;
  featured?: boolean;
  urgent?: boolean;
}

const qudsayaCenterItems: UsedItem[] = [
  {
    id: '1',
    title: 'ثلاجة سامسونج نوفروست',
    titleEn: 'Samsung NoFrost Fridge',
    price: '380',
    originalPrice: '650',
    condition: 'جيدة جداً',
    conditionEn: 'Very Good',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الحي الغربي',
    time: 'منذ يوم',
    featured: true
  },
  {
    id: '2',
    title: 'طقم كنب مودرن 7 قطع',
    titleEn: 'Modern Sofa Set 7 Pieces',
    price: '850',
    originalPrice: '1,600',
    condition: 'ممتاز',
    conditionEn: 'Excellent',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - المركز',
    time: 'منذ 3 أيام',
    featured: true
  },
  {
    id: '3',
    title: 'لابتوب HP برو بوك i7',
    titleEn: 'HP ProBook i7 Laptop',
    price: '420',
    originalPrice: '850',
    condition: 'جيد',
    conditionEn: 'Good',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ ساعتين',
    urgent: true
  },
  {
    id: '4',
    title: 'دراجة هوائية جبلية',
    titleEn: 'Mountain Bike',
    price: '160',
    originalPrice: '320',
    condition: 'جيدة',
    conditionEn: 'Good',
    category: 'sports',
    categoryAr: 'رياضة',
    categoryEn: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ أسبوع'
  },
  {
    id: '5',
    title: 'غسالة LG أوتوماتيك',
    titleEn: 'LG Automatic Washing Machine',
    price: '280',
    originalPrice: '500',
    condition: 'جيدة جداً',
    conditionEn: 'Very Good',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الشارع الرئيسي',
    time: 'منذ 4 أيام'
  },
  {
    id: '6',
    title: 'آيفون 14 برو ماكس 256GB',
    titleEn: 'iPhone 14 Pro Max 256GB',
    price: '850',
    originalPrice: '1,200',
    condition: 'ممتاز',
    conditionEn: 'Excellent',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ 5 ساعات',
    urgent: true
  },
  {
    id: '7',
    title: 'سرير خشب زان مع مرتبة',
    titleEn: 'Oak Wood Bed with Mattress',
    price: '350',
    originalPrice: '700',
    condition: 'جيد',
    conditionEn: 'Good',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الحي الشرقي',
    time: 'منذ يومين'
  },
  {
    id: '8',
    title: 'تلفزيون سامسونج 55 بوصة',
    titleEn: 'Samsung 55 inch TV',
    price: '320',
    originalPrice: '600',
    condition: 'جيدة جداً',
    conditionEn: 'Very Good',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ 6 ساعات',
    featured: true
  }
];

const qudsayaDahiaItems: UsedItem[] = [
  {
    id: '1',
    title: 'ثلاجة ال جي إنفرتر',
    titleEn: 'LG Inverter Fridge',
    price: '350',
    originalPrice: '600',
    condition: 'جيدة جداً',
    conditionEn: 'Very Good',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ يوم',
    featured: true
  },
  {
    id: '2',
    title: 'طقم كنب كلاسيكي',
    titleEn: 'Classic Sofa Set',
    price: '800',
    originalPrice: '1,500',
    condition: 'ممتاز',
    conditionEn: 'Excellent',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - الحي الرئيسي',
    time: 'منذ 3 أيام'
  },
  {
    id: '3',
    title: 'لابتوب ديل XPS 15',
    titleEn: 'Dell XPS 15 Laptop',
    price: '550',
    originalPrice: '1,000',
    condition: 'جيد',
    conditionEn: 'Good',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ ساعتين',
    urgent: true
  },
  {
    id: '4',
    title: 'دراجة نارية هوندا',
    titleEn: 'Honda Motorcycle',
    price: '1,200',
    originalPrice: '2,000',
    condition: 'جيدة',
    conditionEn: 'Good',
    category: 'sports',
    categoryAr: 'رياضة',
    categoryEn: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ أسبوع'
  },
  {
    id: '5',
    title: 'مكيف سبليت 2 طن',
    titleEn: 'Split AC 2 Ton',
    price: '250',
    originalPrice: '450',
    condition: 'جيدة جداً',
    conditionEn: 'Very Good',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631567091046-3b31a31d1f76?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - المركز التجاري',
    time: 'منذ 4 أيام'
  },
  {
    id: '6',
    title: 'بلايستيشن 5 مع ألعاب',
    titleEn: 'PlayStation 5 with Games',
    price: '480',
    originalPrice: '700',
    condition: 'ممتاز',
    conditionEn: 'Excellent',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ 5 ساعات',
    featured: true
  },
  {
    id: '7',
    title: 'طاولة طعام 8 أشخاص',
    titleEn: 'Dining Table 8 Persons',
    price: '280',
    originalPrice: '550',
    condition: 'جيد',
    conditionEn: 'Good',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - الحي الشمالي',
    time: 'منذ يومين'
  },
  {
    id: '8',
    title: 'ساعة أبل 7',
    titleEn: 'Apple Watch 7',
    price: '180',
    originalPrice: '350',
    condition: 'ممتاز',
    conditionEn: 'Excellent',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ 6 ساعات',
    urgent: true
  }
];

const dataByRegion: Record<Region, UsedItem[]> = {
  'qudsaya-center': qudsayaCenterItems,
  'qudsaya-dahia': qudsayaDahiaItems
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Package },
  { id: 'electronics', name: 'إلكترونيات', nameEn: 'Electronics', icon: Smartphone },
  { id: 'furniture', name: 'أثاث', nameEn: 'Furniture', icon: Sofa },
  { id: 'appliances', name: 'أجهزة', nameEn: 'Appliances', icon: Home },
  { id: 'sports', name: 'رياضة', nameEn: 'Sports', icon: Car },
];

export default function UsedItems() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const items = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item => {
    return activeCategory === 'all' || item.category === activeCategory;
  });

  // Check scroll position to show/hide navigation buttons
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
  }, [filteredItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Card width + gap
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

  const nextImage = (itemId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (itemId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const getDiscount = (price: string, original: string) => {
    const p = parseInt(price.replace(/,/g, ''));
    const o = parseInt(original.replace(/,/g, ''));
    return Math.round(((o - p) / o) * 100);
  };

  return (
    <section className="py-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المستعمل' : 'Used Items'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredItems.length} منتج في ${regionName}` : `${filteredItems.length} items in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters - Airbnb Style Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? items.length 
              : items.filter(i => i.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Swipe hint with dots indicator */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredItems.slice(0, 6).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-orange-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          {/* Left Navigation Button */}
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

          {/* Right Navigation Button */}
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

          {/* Scrollable Cards Container with gradient mask */}
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
            {filteredItems.map((item, index) => {
              const isFavorite = favorites.includes(item.id);
              const imageIndex = currentImageIndex[item.id] || 0;
              const discount = getDiscount(item.price, item.originalPrice);
              
              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img 
                      src={item.images[imageIndex]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Image Navigation */}
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(item.id, item.images.length); }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(item.id, item.images.length); }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {item.images.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === imageIndex ? 'bg-white w-3' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Discount Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5" />
                      {discount}%
                    </div>

                    {/* Condition Badge */}
                    <div className="absolute bottom-10 left-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        item.condition === 'ممتاز' ? 'bg-emerald-500 text-white' : 
                        item.condition === 'جيدة جداً' ? 'bg-blue-500 text-white' : 
                        'bg-gray-500 text-white'
                      }`}>
                        {isArabic ? item.condition : item.conditionEn}
                      </span>
                    </div>

                    {/* Featured/Urgent Badge */}
                    {(item.featured || item.urgent) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          item.featured ? 'bg-amber-500 text-white' : 'bg-red-500 text-white animate-pulse'
                        }`}>
                          {item.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'عاجل' : 'Urgent')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="px-1">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {isArabic ? item.title : item.titleEn}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-gray-900">${item.price}</span>
                      <span className="text-xs text-gray-400 line-through">${item.originalPrice}</span>
                    </div>

                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.time}</span>
                      </div>
                    </div>
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
