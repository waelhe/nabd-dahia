'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BedDouble, MapPin, Star, Phone, Wifi, Car, ChevronLeft, ChevronRight, Heart, Coffee, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Hotel {
  id: string;
  name: string;
  nameEn: string;
  type: 'hotel' | 'aparthotel' | 'guesthouse';
  address: string;
  addressEn: string;
  phone: string;
  rating: number;
  image: string;
  priceRange: string;
  stars: number;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasBreakfast?: boolean;
  hasRestaurant?: boolean;
  featured?: boolean;
  new?: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaHotels: Hotel[] = [
  {
    id: 'd1',
    name: 'فندق ضاحية قدسيا',
    nameEn: 'Qudsaya Dahia Hotel',
    type: 'hotel',
    address: 'الساحة الرئيسية - ضاحية قدسيا',
    addressEn: 'Main Square - Qudsaya Dahia',
    phone: '0999111222',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    priceRange: '$$',
    stars: 4,
    hasWifi: true,
    hasParking: true,
    hasBreakfast: true,
    hasRestaurant: true,
    featured: true
  },
  {
    id: 'd2',
    name: 'شقق النخيل الفندقية',
    nameEn: 'Palm Aparthotel',
    type: 'aparthotel',
    address: 'شارع الرئيسي - ضاحية قدسيا',
    addressEn: 'Main Street - Qudsaya Dahia',
    phone: '0999222333',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
    priceRange: '$$',
    stars: 3,
    hasWifi: true,
    hasParking: true,
    new: true
  },
  {
    id: 'd3',
    name: 'بيت الضيافة',
    nameEn: 'Guest House',
    type: 'guesthouse',
    address: 'الحي الجنوبي - ضاحية قدسيا',
    addressEn: 'South District - Qudsaya Dahia',
    phone: '0999333444',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    priceRange: '$',
    stars: 2,
    hasWifi: true,
    hasBreakfast: true
  }
];

// بيانات قدسيا المركز
const qudsayaCenterHotels: Hotel[] = [
  {
    id: 'c1',
    name: 'فندق قدسيا الكبير',
    nameEn: 'Grand Qudsaya Hotel',
    type: 'hotel',
    address: 'طريق قدسيا الرئيسي',
    addressEn: 'Qudsaya Main Road',
    phone: '0999444555',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    priceRange: '$$$',
    stars: 5,
    hasWifi: true,
    hasParking: true,
    hasBreakfast: true,
    hasRestaurant: true,
    featured: true
  },
  {
    id: 'c2',
    name: 'شقق الجبل الفندقية',
    nameEn: 'Mountain Aparthotel',
    type: 'aparthotel',
    address: 'ساحة قدسيا المركز',
    addressEn: 'Qudsaya Center Square',
    phone: '0999555666',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
    priceRange: '$$',
    stars: 3,
    hasWifi: true,
    hasParking: true,
    hasRestaurant: true,
    new: true
  },
  {
    id: 'c3',
    name: 'فندق الوادي',
    nameEn: 'Valley Hotel',
    type: 'hotel',
    address: 'نزلة قدسيا',
    addressEn: 'Qudsaya Slope',
    phone: '0999666777',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    priceRange: '$$',
    stars: 3,
    hasWifi: true,
    hasBreakfast: true
  }
];

const hotelsByRegion: Record<Region, Hotel[]> = {
  'qudsaya-center': qudsayaCenterHotels,
  'qudsaya-dahia': qudsayaDahiaHotels
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: BedDouble },
  { id: 'hotel', name: 'فنادق', nameEn: 'Hotels', icon: BedDouble },
  { id: 'aparthotel', name: 'شقق فندقية', nameEn: 'Aparthotels', icon: BedDouble },
  { id: 'guesthouse', name: 'بيوت ضيافة', nameEn: 'Guest Houses', icon: BedDouble }
];

export default function Hotels() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const hotels = hotelsByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredHotels = hotels.filter(h =>
    activeType === 'all' || h.type === activeType
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
  }, [filteredHotels]);

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

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
    ));
  };

  return (
    <section id="hotels" className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-200">
              <BedDouble className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '🏨 فنادق وإقامات' : '🏨 Hotels & Stays'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredHotels.length} مكان في ${regionName}` : `${filteredHotels.length} places in ${regionName}`}
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
              ? hotels.length
              : hotels.filter(h => h.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredHotels.slice(0, 4).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-purple-500 w-4' : 'bg-gray-300'
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
            {filteredHotels.map((hotel, index) => {
              const isFavorite = favorites.includes(hotel.id);

              return (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={hotel.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Stars Badge */}
                    <div className="absolute top-2 left-2 flex gap-0.5 px-2 py-0.5 bg-white/90 rounded-full">
                      {renderStars(hotel.stars)}
                    </div>

                    {/* Price Range */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">
                      {hotel.priceRange}
                    </span>

                    {/* Type Badge */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-gray-700 text-[10px] font-bold rounded-full">
                      {hotel.type === 'hotel' ? (isArabic ? 'فندق' : 'Hotel') :
                       hotel.type === 'aparthotel' ? (isArabic ? 'شقق' : 'Aparts') :
                       (isArabic ? 'ضيافة' : 'Guest')}
                    </span>

                    {/* Featured/New Badge */}
                    {(hotel.featured || hotel.new) && (
                      <div className="absolute top-2 right-10">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          hotel.featured ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {hotel.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? hotel.name : hotel.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{isArabic ? hotel.address : hotel.addressEn}</span>
                    </div>

                    {/* Features */}
                    <div className="flex gap-2 mb-2">
                      {hotel.hasWifi && (
                        <span className="p-1 bg-gray-100 rounded">
                          <Wifi className="w-3 h-3 text-blue-600" />
                        </span>
                      )}
                      {hotel.hasParking && (
                        <span className="p-1 bg-gray-100 rounded">
                          <Car className="w-3 h-3 text-gray-600" />
                        </span>
                      )}
                      {hotel.hasBreakfast && (
                        <span className="p-1 bg-gray-100 rounded">
                          <Coffee className="w-3 h-3 text-amber-600" />
                        </span>
                      )}
                      {hotel.hasRestaurant && (
                        <span className="p-1 bg-gray-100 rounded">
                          <UtensilsCrossed className="w-3 h-3 text-orange-600" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-900">{hotel.rating}</span>
                      </div>
                      <a
                        href={`tel:${hotel.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{hotel.phone}</span>
                      </a>
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
