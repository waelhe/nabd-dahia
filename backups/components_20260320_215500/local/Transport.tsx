'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bus, MapPin, Clock, Users, AlertCircle, CheckCircle, Route, ChevronLeft, ChevronRight, Heart, Car, Bike, Train, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface RouteData {
  id: string;
  number: string;
  name: string;
  nameEn: string;
  from: string;
  fromEn: string;
  to: string;
  toEn: string;
  stops: number;
  nextBus: string;
  status: string;
  type: 'bus' | 'taxi' | 'private' | 'microbus';
  price?: string;
  featured?: boolean;
  available?: boolean;
}

interface TaxiStation {
  id: string;
  name: string;
  nameEn: string;
  cars: number;
}

const qudsayaCenterRoutes: RouteData[] = [
  {
    id: '1',
    number: 'Q1',
    name: 'خط قدسيا - دمشق',
    nameEn: 'Qudsaya - Damascus Line',
    from: 'قدسيا',
    fromEn: 'Qudsaya',
    to: 'ساحة العباسيين',
    toEn: 'Abbasid Square',
    stops: 10,
    nextBus: '5 دقائق',
    status: 'active',
    type: 'bus',
    price: '500',
    featured: true,
    available: true
  },
  {
    id: '2',
    number: 'Q2',
    name: 'خط قدسيا - المزة',
    nameEn: 'Qudsaya - Mezzeh Line',
    from: 'قدسيا',
    fromEn: 'Qudsaya',
    to: 'المزة',
    toEn: 'Mezzeh',
    stops: 8,
    nextBus: '8 دقائق',
    status: 'active',
    type: 'bus',
    price: '400',
    available: true
  },
  {
    id: '3',
    number: 'Q3',
    name: 'خط قدسيا - البرامكة',
    nameEn: 'Qudsaya - Barameka Line',
    from: 'قدسيا',
    fromEn: 'Qudsaya',
    to: 'البرامكة',
    toEn: 'Barameka',
    stops: 12,
    nextBus: '15 دقيقة',
    status: 'delayed',
    type: 'bus',
    price: '600',
    available: true
  },
  {
    id: '4',
    number: 'T1',
    name: 'تاكسي جماعي - دمشق',
    nameEn: 'Shared Taxi - Damascus',
    from: 'قدسيا',
    fromEn: 'Qudsaya',
    to: 'ساحة العباسيين',
    toEn: 'Abbasid Square',
    stops: 3,
    nextBus: '2 دقائق',
    status: 'active',
    type: 'taxi',
    price: '2000',
    featured: true,
    available: true
  },
  {
    id: '5',
    number: 'M1',
    name: 'ميكروباص - الضاحية',
    nameEn: 'Microbus - Dahia',
    from: 'قدسيا المركز',
    fromEn: 'Qudsaya Center',
    to: 'الضاحية',
    toEn: 'Dahia',
    stops: 6,
    nextBus: '10 دقائق',
    status: 'active',
    type: 'microbus',
    price: '800',
    available: true
  },
  {
    id: '6',
    number: 'P1',
    name: 'نقل خاص - المطار',
    nameEn: 'Private Transfer - Airport',
    from: 'قدسيا',
    fromEn: 'Qudsaya',
    to: 'مطار دمشق الدولي',
    toEn: 'Damascus Intl Airport',
    stops: 0,
    nextBus: 'حسب الطلب',
    status: 'active',
    type: 'private',
    price: '15000',
    featured: true,
    available: true
  }
];

const qudsayaDahiaRoutes: RouteData[] = [
  {
    id: '1',
    number: 'D1',
    name: 'خط الضاحية - دمشق',
    nameEn: 'Dahia - Damascus Line',
    from: 'الضاحية',
    fromEn: 'Dahia',
    to: 'ساحة العباسيين',
    toEn: 'Abbasid Square',
    stops: 15,
    nextBus: '7 دقائق',
    status: 'active',
    type: 'bus',
    price: '600',
    featured: true,
    available: true
  },
  {
    id: '2',
    number: 'D2',
    name: 'خط الضاحية - قدسيا',
    nameEn: 'Dahia - Qudsaya Line',
    from: 'الضاحية',
    fromEn: 'Dahia',
    to: 'قدسيا',
    toEn: 'Qudsaya',
    stops: 5,
    nextBus: '3 دقائق',
    status: 'active',
    type: 'bus',
    price: '300',
    available: true
  },
  {
    id: '3',
    number: 'D3',
    name: 'خط الضاحية - المزة',
    nameEn: 'Dahia - Mezzeh Line',
    from: 'الضاحية',
    fromEn: 'Dahia',
    to: 'المزة',
    toEn: 'Mezzeh',
    stops: 10,
    nextBus: '12 دقيقة',
    status: 'active',
    type: 'bus',
    price: '500',
    available: true
  },
  {
    id: '4',
    number: 'T2',
    name: 'تاكسي جماعي - دمشق',
    nameEn: 'Shared Taxi - Damascus',
    from: 'الضاحية',
    fromEn: 'Dahia',
    to: 'ساحة العباسيين',
    toEn: 'Abbasid Square',
    stops: 4,
    nextBus: '3 دقائق',
    status: 'active',
    type: 'taxi',
    price: '2500',
    featured: true,
    available: true
  },
  {
    id: '5',
    number: 'M2',
    name: 'ميكروباص - قدسيا',
    nameEn: 'Microbus - Qudsaya',
    from: 'الضاحية المركز',
    fromEn: 'Dahia Center',
    to: 'قدسيا',
    toEn: 'Qudsaya',
    stops: 8,
    nextBus: '5 دقائق',
    status: 'active',
    type: 'microbus',
    price: '700',
    available: true
  },
  {
    id: '6',
    number: 'P2',
    name: 'نقل خاص - المطار',
    nameEn: 'Private Transfer - Airport',
    from: 'الضاحية',
    fromEn: 'Dahia',
    to: 'مطار دمشق الدولي',
    toEn: 'Damascus Intl Airport',
    stops: 0,
    nextBus: 'حسب الطلب',
    status: 'active',
    type: 'private',
    price: '18000',
    featured: true,
    available: true
  }
];

const qudsayaCenterTaxi: TaxiStation[] = [
  { id: '1', name: 'محطة قدسيا المركزية', nameEn: 'Qudsaya Central Station', cars: 10 },
  { id: '2', name: 'محطة الساحة', nameEn: 'Square Station', cars: 6 },
  { id: '3', name: 'محطة المدخل', nameEn: 'Entrance Station', cars: 8 }
];

const qudsayaDahiaTaxi: TaxiStation[] = [
  { id: '1', name: 'محطة الضاحية المركزية', nameEn: 'Dahia Central Station', cars: 12 },
  { id: '2', name: 'محطة الحي الشمالي', nameEn: 'North District Station', cars: 5 },
  { id: '3', name: 'محطة السوق', nameEn: 'Market Station', cars: 7 }
];

const dataByRegion = {
  'qudsaya-center': { routes: qudsayaCenterRoutes, taxi: qudsayaCenterTaxi },
  'qudsaya-dahia': { routes: qudsayaDahiaRoutes, taxi: qudsayaDahiaTaxi }
};

const transportFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Bus },
  { id: 'bus', name: 'باصات', nameEn: 'Buses', icon: Bus },
  { id: 'microbus', name: 'ميكروباص', nameEn: 'Microbus', icon: Train },
  { id: 'taxi', name: 'تاكسي', nameEn: 'Taxi', icon: Car },
  { id: 'private', name: 'نقل خاص', nameEn: 'Private', icon: Bike },
];

export default function Transport() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const regionData = dataByRegion[region];
  const routes = regionData?.routes || [];
  const taxiStations = regionData?.taxi || [];

  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRoutes = routes.filter(route => {
    return activeFilter === 'all' || route.type === activeFilter;
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
  }, [filteredRoutes]);

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', text: isArabic ? 'نشط' : 'Active' };
      case 'delayed':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', text: isArabic ? 'متأخر' : 'Delayed' };
      default:
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: isArabic ? 'متوقف' : 'Stopped' };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'bus':
        return { icon: Bus, color: 'text-teal-600', bg: 'bg-teal-100', text: isArabic ? 'باص' : 'Bus' };
      case 'taxi':
        return { icon: Car, color: 'text-amber-600', bg: 'bg-amber-100', text: isArabic ? 'تاكسي' : 'Taxi' };
      case 'microbus':
        return { icon: Train, color: 'text-purple-600', bg: 'bg-purple-100', text: isArabic ? 'ميكروباص' : 'Microbus' };
      case 'private':
        return { icon: Bike, color: 'text-indigo-600', bg: 'bg-indigo-100', text: isArabic ? 'نقل خاص' : 'Private' };
      default:
        return { icon: Bus, color: 'text-gray-600', bg: 'bg-gray-100', text: type };
    }
  };

  return (
    <section className="py-4 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg shadow-teal-200">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المواصلات والنقل' : 'Transportation'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredRoutes.length} خط في ${regionName}` : `${filteredRoutes.length} routes in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Transport Type Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {transportFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            const count = filter.id === 'all' 
              ? routes.length 
              : routes.filter(r => r.type === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-teal-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredRoutes.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-teal-500 w-4' : 'bg-gray-300'
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
            {filteredRoutes.map((route, index) => {
              const statusConfig = getStatusConfig(route.status);
              const typeConfig = getTypeConfig(route.type);
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;
              const isFavorite = favorites.includes(route.id);

              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header with Type & Actions */}
                  <div className="relative p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100">
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(route.id)}
                      className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-400'}`} 
                      />
                    </button>

                    {/* Route Number & Type */}
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 ${typeConfig.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                        <TypeIcon className={`w-7 h-7 ${typeConfig.color}`} />
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900">{route.number}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold ${typeConfig.color} ${typeConfig.bg} px-2 py-0.5 rounded-full`}>
                            {typeConfig.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {route.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Route Name */}
                    <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
                      {isArabic ? route.name : route.nameEn}
                    </h4>

                    {/* From/To */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <span className="truncate">{isArabic ? route.from : route.fromEn}</span>
                      <span className="text-gray-300">→</span>
                      <span className="truncate">{isArabic ? route.to : route.toEn}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Route className="w-3.5 h-3.5" />
                        <span>{route.stops} {isArabic ? 'محطة' : 'stops'}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${statusConfig.bg} px-2 py-0.5 rounded-full`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
                        <span className={`font-bold ${statusConfig.color}`}>{statusConfig.text}</span>
                      </div>
                    </div>

                    {/* Price & Next Bus */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-500">{isArabic ? 'السعر:' : 'Price:'}</span>
                        <span className="text-sm font-black text-gray-900">{route.price}</span>
                        <span className="text-[10px] text-gray-500">ل.س</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{route.nextBus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Available Badge */}
                  {route.available && (
                    <div className="absolute bottom-16 right-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                        {isArabic ? 'متاح' : 'Available'}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Taxi Stations Section */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            {isArabic ? 'محطات التاكسي الجماعي' : 'Shared Taxi Stations'}
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {taxiStations.map((station, index) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{isArabic ? station.name : station.nameEn}</h4>
                    <p className="text-xs text-gray-500">{station.cars} {isArabic ? 'سيارة متاحة' : 'cars available'}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{station.cars}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
