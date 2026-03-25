'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, MapPin, Clock, Truck, Star, Store, ChevronLeft, ChevronRight, Heart, Carrot, Beef, Fish, Shirt, Apple, Milk } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Market {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'vegetables' | 'meat' | 'fish' | 'clothes' | 'dairy';
  image: string;
  location: string;
  hours: string;
  rating: number;
  featured?: boolean;
  new?: boolean;
}

interface Supermarket {
  name: string;
  nameEn: string;
  delivery: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaMarkets: Market[] = [
  {
    id: '1',
    name: 'سوق الخضار - الضاحية',
    nameEn: 'Vegetable Market - Dahia',
    type: 'خضار وفواكه',
    typeEn: 'Vegetables & Fruits',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '5:00 - 14:00',
    rating: 4.5,
    featured: true
  },
  {
    id: '2',
    name: 'سوق اللحوم',
    nameEn: 'Meat Market',
    type: 'لحوم',
    typeEn: 'Meat',
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الشمال',
    hours: '6:00 - 16:00',
    rating: 4.7
  },
  {
    id: '3',
    name: 'سوق الأسماك',
    nameEn: 'Fish Market',
    type: 'أسماك',
    typeEn: 'Fish',
    category: 'fish',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الجنوب',
    hours: '6:00 - 14:00',
    rating: 4.4,
    new: true
  },
  {
    id: '4',
    name: 'سوق الملابس',
    nameEn: 'Clothes Market',
    type: 'ملابس',
    typeEn: 'Clothes',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 20:00',
    rating: 4.3
  },
  {
    id: '5',
    name: 'سوق الألبان الطازجة',
    nameEn: 'Fresh Dairy Market',
    type: 'ألبان',
    typeEn: 'Dairy',
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '6:00 - 12:00',
    rating: 4.6,
    featured: true
  },
  {
    id: '6',
    name: 'سوق الخضار الشعبي',
    nameEn: 'Popular Vegetable Market',
    type: 'خضار وفواكه',
    typeEn: 'Vegetables & Fruits',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الشرق',
    hours: '5:00 - 15:00',
    rating: 4.4,
    new: true
  }
];

const qudsayaDahiaSupermarkets: Supermarket[] = [
  { name: 'سوبرماركت الأهلية', nameEn: 'Ahliya Supermarket', delivery: true },
  { name: 'ماركت الضاحية', nameEn: 'Dahia Market', delivery: true },
  { name: 'سوبر ستور', nameEn: 'Super Store', delivery: true }
];

// بيانات قدسيا المركز
const qudsayaCenterMarkets: Market[] = [
  {
    id: 'q1',
    name: 'سوق الخضار - قدسيا',
    nameEn: 'Vegetable Market - Qudsaya',
    type: 'خضار وفواكه',
    typeEn: 'Vegetables & Fruits',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة الرئيسية',
    hours: '5:00 - 15:00',
    rating: 4.6,
    featured: true
  },
  {
    id: 'q2',
    name: 'سوق اللحوم',
    nameEn: 'Meat Market',
    type: 'لحوم',
    typeEn: 'Meat',
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '6:00 - 17:00',
    rating: 4.8
  },
  {
    id: 'q3',
    name: 'سوق الأسماك الطازجة',
    nameEn: 'Fresh Fish Market',
    type: 'أسماك',
    typeEn: 'Fish',
    category: 'fish',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الشرق',
    hours: '6:00 - 13:00',
    rating: 4.5,
    new: true
  },
  {
    id: 'q4',
    name: 'سوق الملابس الشعبي',
    nameEn: 'Popular Clothes Market',
    type: 'ملابس',
    typeEn: 'Clothes',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 21:00',
    rating: 4.4
  },
  {
    id: 'q5',
    name: 'سوق الألبان والبيض',
    nameEn: 'Dairy & Eggs Market',
    type: 'ألبان',
    typeEn: 'Dairy',
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الغرب',
    hours: '5:30 - 12:00',
    rating: 4.7,
    featured: true
  },
  {
    id: 'q6',
    name: 'سوق الفواكه الموسمية',
    nameEn: 'Seasonal Fruits Market',
    type: 'خضار وفواكه',
    typeEn: 'Vegetables & Fruits',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الجنوب',
    hours: '6:00 - 14:00',
    rating: 4.5,
    new: true
  }
];

const qudsayaCenterSupermarkets: Supermarket[] = [
  { name: 'سوبرماركت قدسيا', nameEn: 'Qudsaya Supermarket', delivery: true },
  { name: 'ماركت الجبل', nameEn: 'Mountain Market', delivery: true },
  { name: 'ميني ماركت', nameEn: 'Mini Mart', delivery: false }
];

const dataByRegion: Record<Region, { markets: Market[]; supermarkets: Supermarket[] }> = {
  'qudsaya-center': { markets: qudsayaCenterMarkets, supermarkets: qudsayaCenterSupermarkets },
  'qudsaya-dahia': { markets: qudsayaDahiaMarkets, supermarkets: qudsayaDahiaSupermarkets }
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: ShoppingCart },
  { id: 'vegetables', name: 'خضار', nameEn: 'Vegetables', icon: Carrot },
  { id: 'meat', name: 'لحوم', nameEn: 'Meat', icon: Beef },
  { id: 'fish', name: 'أسماك', nameEn: 'Fish', icon: Fish },
  { id: 'dairy', name: 'ألبان', nameEn: 'Dairy', icon: Milk },
  { id: 'clothes', name: 'ملابس', nameEn: 'Clothes', icon: Shirt },
];

export default function Markets() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const { markets, supermarkets } = dataByRegion[region];

  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMarkets = markets.filter(market => {
    return activeCategory === 'all' || market.category === activeCategory;
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
  }, [filteredMarkets]);

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

  return (
    <section className="py-4 bg-gradient-to-b from-lime-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl shadow-lg shadow-lime-200">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الأسواق' : 'Markets'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredMarkets.length} سوق في ${regionName}` : `${filteredMarkets.length} markets in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all'
              ? markets.length
              : markets.filter(m => m.category === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-lime-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-lime-200' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* تلميح للمستخدم */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredMarkets.slice(0, 8).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-lime-500 w-4' : 'bg-gray-300'
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

          {/* Scrollable Cards Container - مع gradient mask */}
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
            {filteredMarkets.map((market, index) => {
              const isFavorite = favorites.includes(market.id);

              return (
                <div
                  key={market.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={market.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(market.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-600 text-white">
                        {isArabic ? market.type : market.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    {(market.featured || market.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          market.featured ? 'bg-white/90 text-gray-900' : 'bg-emerald-500 text-white'
                        }`}>
                          {market.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Market Info */}
                  <div className="px-1">
                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{market.location}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold">{market.rating}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? market.name : market.nameEn}
                    </h3>

                    {/* Hours */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{market.hours}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supermarkets with delivery */}
        <div className="bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-5 h-5 text-white" />
            <span className="text-white font-bold">{isArabic ? 'سوبرماركت مع توصيل' : 'Supermarkets with Delivery'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {supermarkets.map((market, index) => (
              <div key={index} className="bg-white/20 backdrop-blur rounded-xl p-3 flex items-center justify-between">
                <span className="text-white font-medium text-sm">{isArabic ? market.name : market.nameEn}</span>
                {market.delivery && (
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Truck className="w-3 h-3" />
                    <span>{isArabic ? 'توصيل' : 'Delivery'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
