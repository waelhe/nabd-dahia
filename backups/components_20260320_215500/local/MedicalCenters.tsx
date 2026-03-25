'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Building2, MapPin, Star, Clock, Phone, ChevronLeft, ChevronRight, Heart, BedDouble, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface MedicalCenter {
  id: string;
  name: string;
  nameEn: string;
  type: 'hospital' | 'clinic';
  address: string;
  addressEn: string;
  phone: string;
  specialties: string[];
  specialtiesEn: string[];
  rating: number;
  image: string;
  hasEmergency?: boolean;
  beds?: number;
}

const qudsayaCenters: MedicalCenter[] = [
  {
    id: '1',
    name: 'مستشفى قدسيا',
    nameEn: 'Qudsaya Hospital',
    type: 'hospital',
    address: 'طريق قدسيا الرئيسي',
    addressEn: 'Qudsaya Main Road',
    phone: '0999111222',
    specialties: ['طوارئ', 'جراحة', 'باطنية', 'أطفال'],
    specialtiesEn: ['Emergency', 'Surgery', 'Internal', 'Pediatrics'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    hasEmergency: true,
    beds: 50
  },
  {
    id: '2',
    name: 'مستوصف الشفاء',
    nameEn: 'Al-Shifa Clinic',
    type: 'clinic',
    address: 'ساحة قدسيا المركز',
    addressEn: 'Qudsaya Center Square',
    phone: '0999333444',
    specialties: ['عام', 'أسنان', 'عيون'],
    specialtiesEn: ['General', 'Dental', 'Eyes'],
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    name: 'مستوصف النور',
    nameEn: 'Al-Noor Clinic',
    address: 'الحي الغربي - قدسيا',
    addressEn: 'West District - Qudsaya',
    type: 'clinic',
    phone: '0999555666',
    specialties: ['نسائية', 'أطفال', 'جلدية'],
    specialtiesEn: ['Gynecology', 'Pediatrics', 'Dermatology'],
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
  }
];

const qudsayaDahiaCenters: MedicalCenter[] = [
  {
    id: '1',
    name: 'مستشفى الضاحية',
    nameEn: 'Dahia Hospital',
    type: 'hospital',
    address: 'الساحة الرئيسية - ضاحية قدسيا',
    addressEn: 'Main Square - Qudsaya Dahia',
    phone: '0999777888',
    specialties: ['طوارئ', 'جراحة', 'عظام', 'قلبية'],
    specialtiesEn: ['Emergency', 'Surgery', 'Orthopedics', 'Cardiology'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    hasEmergency: true,
    beds: 80
  },
  {
    id: '2',
    name: 'مستوصف الرحمة',
    nameEn: 'Al-Rahma Clinic',
    type: 'clinic',
    address: 'شارع الرئيسي - ضاحية قدسيا',
    addressEn: 'Main Street - Qudsaya Dahia',
    phone: '0999000111',
    specialties: ['عام', 'أسنان', 'تجميل'],
    specialtiesEn: ['General', 'Dental', 'Cosmetic'],
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80'
  }
];

const centersByRegion: Record<Region, MedicalCenter[]> = {
  'qudsaya-center': qudsayaCenters,
  'qudsaya-dahia': qudsayaDahiaCenters
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Building2 },
  { id: 'hospital', name: 'مشافي', nameEn: 'Hospitals', icon: BedDouble },
  { id: 'clinic', name: 'مستوصفات', nameEn: 'Clinics', icon: Stethoscope }
];

export default function MedicalCenters() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const centers = centersByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCenters = centers.filter(c =>
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
  }, [filteredCenters]);

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
    <section id="medical-centers" className="py-4 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '🏨 مراكز طبية' : '🏨 Medical Centers'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredCenters.length} مركز في ${regionName}` : `${filteredCenters.length} centers in ${regionName}`}
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
              ? centers.length
              : centers.filter(c => c.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-rose-200' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
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
            {filteredCenters.map((center, index) => {
              const isFavorite = favorites.includes(center.id);

              return (
                <motion.div
                  key={center.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={center.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(center.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Type Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      center.type === 'hospital'
                        ? 'bg-rose-500 text-white'
                        : 'bg-pink-500 text-white'
                    }`}>
                      {center.type === 'hospital'
                        ? (isArabic ? 'مشفى' : 'Hospital')
                        : (isArabic ? 'مستوصف' : 'Clinic')}
                    </span>

                    {/* Emergency Badge */}
                    {center.hasEmergency && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                        🚨 {isArabic ? 'طوارئ' : 'ER'}
                      </span>
                    )}

                    {/* Beds Count */}
                    {center.beds && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-gray-700 text-[10px] font-bold rounded-full">
                        🛏️ {center.beds} {isArabic ? 'سرير' : 'beds'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? center.name : center.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{isArabic ? center.address : center.addressEn}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? center.specialties : center.specialtiesEn).slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-900">{center.rating}</span>
                      </div>
                      <a
                        href={`tel:${center.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{center.phone}</span>
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
