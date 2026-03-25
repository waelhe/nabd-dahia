'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Pill, MapPin, Star, Clock, Phone, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Pharmacy {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  addressEn: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  rating: number;
  image: string;
  is24h?: boolean;
  hasDelivery?: boolean;
}

const qudsayaCenterPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'صيدلية الشفاء',
    nameEn: 'Al-Shifa Pharmacy',
    address: 'الساحة الرئيسية - قدسيا المركز',
    addressEn: 'Main Square - Qudsaya Center',
    phone: '0999123456',
    hours: '24 ساعة',
    isOpen: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
    is24h: true,
    hasDelivery: true
  },
  {
    id: '2',
    name: 'صيدلية النور',
    nameEn: 'Al-Noor Pharmacy',
    address: 'شارع المدرسة - قدسيا المركز',
    addressEn: 'School Street - Qudsaya Center',
    phone: '0998765432',
    hours: '8 ص - 10 م',
    isOpen: true,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    hasDelivery: true
  },
  {
    id: '3',
    name: 'صيدلية الرحمة',
    nameEn: 'Al-Rahma Pharmacy',
    address: 'الحي الغربي - قدسيا المركز',
    addressEn: 'West District - Qudsaya Center',
    phone: '0998111222',
    hours: '24 ساعة',
    isOpen: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80',
    is24h: true
  },
  {
    id: '4',
    name: 'صيدلية القدس',
    nameEn: 'Al-Quds Pharmacy',
    address: 'نزلة قدسيا',
    addressEn: 'Qudsaya Slope',
    phone: '0999333444',
    hours: '9 ص - 9 م',
    isOpen: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80'
  }
];

const qudsayaDahiaPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'صيدلية الضاحية',
    nameEn: 'Dahia Pharmacy',
    address: 'الساحة الرئيسية - ضاحية قدسيا',
    addressEn: 'Main Square - Qudsaya Dahia',
    phone: '0999555666',
    hours: '24 ساعة',
    isOpen: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
    is24h: true,
    hasDelivery: true
  },
  {
    id: '2',
    name: 'صيدلية الأمل',
    nameEn: 'Al-Amal Pharmacy',
    address: 'شارع الرئيسي - ضاحية قدسيا',
    addressEn: 'Main Street - Qudsaya Dahia',
    phone: '0999777888',
    hours: '8 ص - 12 ص',
    isOpen: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    is24h: true
  },
  {
    id: '3',
    name: 'صيدلية الصحة',
    nameEn: 'Al-Seha Pharmacy',
    address: 'الحي الجنوبي - ضاحية قدسيا',
    addressEn: 'South District - Qudsaya Dahia',
    phone: '0999000111',
    hours: '9 ص - 10 م',
    isOpen: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80',
    hasDelivery: true
  }
];

const pharmaciesByRegion: Record<Region, Pharmacy[]> = {
  'qudsaya-center': qudsayaCenterPharmacies,
  'qudsaya-dahia': qudsayaDahiaPharmacies
};

export default function Pharmacies() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const pharmacies = pharmaciesByRegion[region];

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

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
  }, [pharmacies]);

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
    <section id="pharmacies" className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '💊 الصيدليات' : '💊 Pharmacies'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${pharmacies.length} صيدلية في ${regionName}` : `${pharmacies.length} pharmacies in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Scroll Hint */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {pharmacies.slice(0, 4).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-emerald-500 w-4' : 'bg-gray-300'
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
            {pharmacies.map((pharmacy, index) => {
              const isFavorite = favorites.includes(pharmacy.id);

              return (
                <motion.div
                  key={pharmacy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={pharmacy.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(pharmacy.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Status Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      pharmacy.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {pharmacy.isOpen ? (isArabic ? 'مفتوح' : 'Open') : (isArabic ? 'مغلق' : 'Closed')}
                    </span>

                    {/* 24h Badge */}
                    {pharmacy.is24h && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                        24H
                      </span>
                    )}

                    {/* Delivery Badge */}
                    {pharmacy.hasDelivery && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                        {isArabic ? 'توصيل' : 'Delivery'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? pharmacy.name : pharmacy.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{isArabic ? pharmacy.address : pharmacy.addressEn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-900">{pharmacy.rating}</span>
                      </div>
                      <a
                        href={`tel:${pharmacy.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{pharmacy.phone}</span>
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
