'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Fuel, MapPin, Star, Clock, Phone, ChevronLeft, ChevronRight, Heart, Droplets, Car, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface GasStation {
  id: string;
  name: string;
  nameEn: string;
  type: 'gas' | 'wash' | 'service';
  address: string;
  addressEn: string;
  phone: string;
  rating: number;
  image: string;
  isOpen: boolean;
  hasWash?: boolean;
  hasOil?: boolean;
  hasAir?: boolean;
  is24h?: boolean;
  fuelTypes?: string[];
}

// بيانات ضاحية قدسيا
const qudsayaDahiaStations: GasStation[] = [
  {
    id: 'd1',
    name: 'محطة بنزين الضاحية',
    nameEn: 'Dahia Gas Station',
    type: 'gas',
    address: 'الساحة الرئيسية - ضاحية قدسيا',
    addressEn: 'Main Square - Qudsaya Dahia',
    phone: '0999111222',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    is24h: true,
    hasWash: true,
    hasOil: true,
    hasAir: true,
    fuelTypes: ['بنزين', 'ديزل']
  },
  {
    id: 'd2',
    name: 'غسيل السيارات النظيف',
    nameEn: 'Clean Car Wash',
    type: 'wash',
    address: 'شارع الرئيسي - ضاحية قدسيا',
    addressEn: 'Main Street - Qudsaya Dahia',
    phone: '0999222333',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWash: true
  },
  {
    id: 'd3',
    name: 'مركز صيانة الضاحية',
    nameEn: 'Dahia Service Center',
    type: 'service',
    address: 'الحي الجنوبي - ضاحية قدسيا',
    addressEn: 'South District - Qudsaya Dahia',
    phone: '0999333444',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasOil: true,
    hasAir: true
  }
];

// بيانات قدسيا المركز
const qudsayaCenterStations: GasStation[] = [
  {
    id: 'c1',
    name: 'محطة بنزين القدس',
    nameEn: 'Al-Quds Gas Station',
    type: 'gas',
    address: 'طريق قدسيا الرئيسي',
    addressEn: 'Qudsaya Main Road',
    phone: '0999444555',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    is24h: true,
    hasWash: true,
    hasOil: true,
    hasAir: true,
    fuelTypes: ['بنزين', 'ديزل', 'غاز']
  },
  {
    id: 'c2',
    name: 'غسيل الأمل',
    nameEn: 'Al-Amal Car Wash',
    type: 'wash',
    address: 'ساحة قدسيا المركز',
    addressEn: 'Qudsaya Center Square',
    phone: '0999555666',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasWash: true
  },
  {
    id: 'c3',
    name: 'ورشة الصفاء',
    nameEn: 'Al-Safa Workshop',
    type: 'service',
    address: 'الحي الغربي - قدسيا',
    addressEn: 'West District - Qudsaya',
    phone: '0999666777',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    hasOil: true,
    hasAir: true
  }
];

const stationsByRegion: Record<Region, GasStation[]> = {
  'qudsaya-center': qudsayaCenterStations,
  'qudsaya-dahia': qudsayaDahiaStations
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Fuel },
  { id: 'gas', name: 'محطات بنزين', nameEn: 'Gas Stations', icon: Fuel },
  { id: 'wash', name: 'غسيل سيارات', nameEn: 'Car Wash', icon: Car },
  { id: 'service', name: 'صيانة سريعة', nameEn: 'Quick Service', icon: Wrench }
];

export default function GasStations() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const stations = stationsByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredStations = stations.filter(s =>
    activeType === 'all' || s.type === activeType
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
  }, [filteredStations]);

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
    <section id="gas-stations" className="py-4 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-200">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '⛽ بنزين وخدمات سيارات' : '⛽ Gas & Car Services'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredStations.length} مكان في ${regionName}` : `${filteredStations.length} places in ${regionName}`}
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
              ? stations.length
              : stations.filter(s => s.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-green-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredStations.slice(0, 4).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-green-500 w-4' : 'bg-gray-300'
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
            {filteredStations.map((station, index) => {
              const isFavorite = favorites.includes(station.id);

              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={station.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(station.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Status Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      station.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {station.isOpen ? (isArabic ? 'مفتوح' : 'Open') : (isArabic ? 'مغلق' : 'Closed')}
                    </span>

                    {/* 24h Badge */}
                    {station.is24h && (
                      <span className="absolute top-2 right-10 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                        24H
                      </span>
                    )}

                    {/* Type Badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                      {station.type === 'gas' ? (isArabic ? 'بنزين' : 'Gas') :
                       station.type === 'wash' ? (isArabic ? 'غسيل' : 'Wash') :
                       (isArabic ? 'صيانة' : 'Service')}
                    </span>

                    {/* Features Badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {station.hasWash && (
                        <span className="p-1 bg-white/90 rounded-full">
                          <Car className="w-3 h-3 text-blue-600" />
                        </span>
                      )}
                      {station.hasOil && (
                        <span className="p-1 bg-white/90 rounded-full">
                          <Droplets className="w-3 h-3 text-amber-600" />
                        </span>
                      )}
                      {station.hasAir && (
                        <span className="p-1 bg-white/90 rounded-full">
                          <Wrench className="w-3 h-3 text-gray-600" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? station.name : station.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{isArabic ? station.address : station.addressEn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-900">{station.rating}</span>
                      </div>
                      <a
                        href={`tel:${station.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{station.phone}</span>
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
