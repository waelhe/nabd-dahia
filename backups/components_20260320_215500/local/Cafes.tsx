'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Coffee, MapPin, Star, Clock, Wifi, ChevronLeft, ChevronRight, Heart, Cigarette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Cafe {
  id: string;
  name: string;
  nameEn: string;
  type: 'cafe' | 'shisha' | 'dessert';
  address: string;
  addressEn: string;
  rating: number;
  image: string;
  isOpen: boolean;
  hasWifi?: boolean;
  hasShisha?: boolean;
  featured?: boolean;
  new?: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaCafes: Cafe[] = [
  {
    id: 'd1',
    name: 'كافيه النخيل',
    nameEn: 'Palm Cafe',
    type: 'cafe',
    address: 'الساحة الرئيسية - ضاحية قدسيا',
    addressEn: 'Main Square - Qudsaya Dahia',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true,
    hasShisha: true,
    featured: true
  },
  {
    id: 'd2',
    name: 'كافيه الروضة',
    nameEn: 'Rawda Cafe',
    type: 'shisha',
    address: 'شارع الرئيسي - ضاحية قدسيا',
    addressEn: 'Main Street - Qudsaya Dahia',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasShisha: true,
    new: true
  },
  {
    id: 'd3',
    name: 'حلويات الضاحية',
    nameEn: 'Dahia Sweets',
    type: 'dessert',
    address: 'الحي الجنوبي - ضاحية قدسيا',
    addressEn: 'South District - Qudsaya Dahia',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true,
    featured: true
  },
  {
    id: 'd4',
    name: 'كافيه الجسر',
    nameEn: 'Bridge Cafe',
    type: 'cafe',
    address: 'نزلة الضاحية',
    addressEn: 'Dahia Slope',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true,
    hasShisha: true
  }
];

// بيانات قدسيا المركز
const qudsayaCenterCafes: Cafe[] = [
  {
    id: 'c1',
    name: 'كافيه الجبل',
    nameEn: 'Mountain Cafe',
    type: 'cafe',
    address: 'ساحة قدسيا المركز',
    addressEn: 'Qudsaya Center Square',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true,
    hasShisha: true,
    featured: true
  },
  {
    id: 'c2',
    name: 'استراحة الصفاء',
    nameEn: 'Al-Safa Lounge',
    type: 'shisha',
    address: 'شارع المدرسة - قدسيا',
    addressEn: 'School Street - Qudsaya',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasShisha: true,
    new: true
  },
  {
    id: 'c3',
    name: 'حلويات القدس',
    nameEn: 'Al-Quds Sweets',
    type: 'dessert',
    address: 'الحي الغربي - قدسيا',
    addressEn: 'West District - Qudsaya',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true,
    featured: true
  },
  {
    id: 'c4',
    name: 'كافيه الوادي',
    nameEn: 'Valley Cafe',
    type: 'cafe',
    address: 'نزلة قدسيا',
    addressEn: 'Qudsaya Slope',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWifi: true
  }
];

const cafesByRegion: Record<Region, Cafe[]> = {
  'qudsaya-center': qudsayaCenterCafes,
  'qudsaya-dahia': qudsayaDahiaCafes
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Coffee },
  { id: 'cafe', name: 'مقاهي', nameEn: 'Cafes', icon: Coffee },
  { id: 'shisha', name: 'أراكيل', nameEn: 'Shisha', icon: Cigarette },
  { id: 'dessert', name: 'حلويات', nameEn: 'Desserts', icon: Star }
];

export default function Cafes() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const cafes = cafesByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCafes = cafes.filter(c =>
    activeType === 'all' || c.type === activeType
  );

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
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
  }, [filteredCafes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
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
    <section id="cafes" className="py-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '☕ المقاهي والحلويات' : '☕ Cafes & Desserts'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredCafes.length} مكان في ${regionName}` : `${filteredCafes.length} places in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.id;
            const count = filter.id === 'all'
              ? cafes.length
              : cafes.filter(c => c.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white'
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

        {/* Scroll Hint */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredCafes.slice(0, 4).map((_, idx) => (
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

          {/* Scrollable Cards */}
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
            {filteredCafes.map((cafe, index) => {
              const isFavorite = favorites.includes(cafe.id);

              return (
                <motion.div
                  key={cafe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={cafe.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(cafe.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Status Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      cafe.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {cafe.isOpen ? (isArabic ? 'مفتوح' : 'Open') : (isArabic ? 'مغلق' : 'Closed')}
                    </span>

                    {/* Type Badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                      {cafe.type === 'cafe' ? (isArabic ? 'مقهى' : 'Cafe') :
                       cafe.type === 'shisha' ? (isArabic ? 'أركيلة' : 'Shisha') :
                       (isArabic ? 'حلويات' : 'Desserts')}
                    </span>

                    {/* Features Badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {cafe.hasWifi && (
                        <span className="p-1 bg-white/90 rounded-full">
                          <Wifi className="w-3 h-3 text-blue-600" />
                        </span>
                      )}
                      {cafe.hasShisha && (
                        <span className="p-1 bg-white/90 rounded-full">
                          <Cigarette className="w-3 h-3 text-gray-600" />
                        </span>
                      )}
                    </div>

                    {/* Featured/New Badge */}
                    {(cafe.featured || cafe.new) && (
                      <div className="absolute top-2 right-10">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          cafe.featured ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {cafe.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? cafe.name : cafe.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{isArabic ? cafe.address : cafe.addressEn}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-900">{cafe.rating}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
