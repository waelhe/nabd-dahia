'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Wrench, Phone, Star, MapPin, Clock, Shield, Heart, ChevronLeft, ChevronRight, Zap, Droplets, Hammer, Paintbrush, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Craftsman {
  id: string;
  name: string;
  nameEn: string;
  profession: string;
  professionEn: string;
  professionCategory: 'electrician' | 'plumber' | 'carpenter' | 'painter' | 'ac' | 'general';
  rating: number;
  reviews: number;
  images: string[];
  available: boolean;
  phone: string;
  location: string;
  experience: string;
  verified?: boolean;
  featured?: boolean;
}

const qudsayaCenterCraftsmen: Craftsman[] = [
  {
    id: '1',
    name: 'أحمد الكهربائي',
    nameEn: 'Ahmed Electrician',
    profession: 'كهربائي',
    professionEn: 'Electrician',
    professionCategory: 'electrician',
    rating: 4.9,
    reviews: 160,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999123456',
    location: 'قدسيا - المركز',
    experience: '15 سنة',
    verified: true,
    featured: true
  },
  {
    id: '2',
    name: 'محمود السباك',
    nameEn: 'Mahmoud Plumber',
    profession: 'سباك',
    professionEn: 'Plumber',
    professionCategory: 'plumber',
    rating: 4.7,
    reviews: 95,
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0998765432',
    location: 'قدسيا',
    experience: '10 سنوات',
    verified: true
  },
  {
    id: '3',
    name: 'خالد النجار',
    nameEn: 'Khaled Carpenter',
    profession: 'نجار',
    professionEn: 'Carpenter',
    professionCategory: 'carpenter',
    rating: 4.8,
    reviews: 70,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80',
    ],
    available: false,
    phone: '0997654321',
    location: 'قدسيا - الحي الغربي',
    experience: '12 سنة',
    featured: true
  },
  {
    id: '4',
    name: 'يوسف الدهان',
    nameEn: 'Youssef Painter',
    profession: 'دهان',
    professionEn: 'Painter',
    professionCategory: 'painter',
    rating: 4.6,
    reviews: 50,
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0996543210',
    location: 'قدسيا',
    experience: '8 سنوات'
  },
  {
    id: '5',
    name: 'سامي فني تكييف',
    nameEn: 'Sami AC Technician',
    profession: 'فني تكييف',
    professionEn: 'AC Technician',
    professionCategory: 'ac',
    rating: 4.9,
    reviews: 85,
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f52586?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631567091046-3b31a31d1f76?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999555666',
    location: 'قدسيا - الشارع الرئيسي',
    experience: '7 سنوات',
    verified: true,
    featured: true
  },
  {
    id: '6',
    name: 'عمر صيانة عامة',
    nameEn: 'Omar General Maintenance',
    profession: 'صيانة عامة',
    professionEn: 'General Maintenance',
    professionCategory: 'general',
    rating: 4.5,
    reviews: 45,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999777888',
    location: 'قدسيا',
    experience: '5 سنوات'
  },
  {
    id: '7',
    name: 'فادي الكهربائي',
    nameEn: 'Fadi Electrician',
    profession: 'كهربائي',
    professionEn: 'Electrician',
    professionCategory: 'electrician',
    rating: 4.8,
    reviews: 120,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999333444',
    location: 'قدسيا - الحي الشرقي',
    experience: '11 سنة',
    verified: true
  },
  {
    id: '8',
    name: 'رامي السباك',
    nameEn: 'Rami Plumber',
    profession: 'سباك',
    professionEn: 'Plumber',
    professionCategory: 'plumber',
    rating: 4.7,
    reviews: 78,
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    ],
    available: false,
    phone: '0999222333',
    location: 'قدسيا',
    experience: '9 سنوات'
  }
];

const qudsayaDahiaCraftsmen: Craftsman[] = [
  {
    id: '1',
    name: 'سامي الكهربائي',
    nameEn: 'Sami Electrician',
    profession: 'كهربائي',
    professionEn: 'Electrician',
    professionCategory: 'electrician',
    rating: 4.8,
    reviews: 145,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999234567',
    location: 'الضاحية',
    experience: '13 سنة',
    verified: true,
    featured: true
  },
  {
    id: '2',
    name: 'عمر السباك',
    nameEn: 'Omar Plumber',
    profession: 'سباك',
    professionEn: 'Plumber',
    professionCategory: 'plumber',
    rating: 4.9,
    reviews: 110,
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0998345678',
    location: 'الضاحية - الحي الرئيسي',
    experience: '11 سنة',
    verified: true,
    featured: true
  },
  {
    id: '3',
    name: 'فادي النجار',
    nameEn: 'Fadi Carpenter',
    profession: 'نجار',
    professionEn: 'Carpenter',
    professionCategory: 'carpenter',
    rating: 4.7,
    reviews: 85,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0997456789',
    location: 'الضاحية',
    experience: '10 سنوات'
  },
  {
    id: '4',
    name: 'رامي الدهان',
    nameEn: 'Rami Painter',
    profession: 'دهان',
    professionEn: 'Painter',
    professionCategory: 'painter',
    rating: 4.5,
    reviews: 60,
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    ],
    available: false,
    phone: '0996567890',
    location: 'الضاحية',
    experience: '7 سنوات'
  },
  {
    id: '5',
    name: 'حسان فني تكييف',
    nameEn: 'Hassan AC Technician',
    profession: 'فني تكييف',
    professionEn: 'AC Technician',
    professionCategory: 'ac',
    rating: 4.8,
    reviews: 92,
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f52586?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631567091046-3b31a31d1f76?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999666777',
    location: 'الضاحية - المركز التجاري',
    experience: '6 سنوات',
    verified: true
  },
  {
    id: '6',
    name: 'نزار صيانة عامة',
    nameEn: 'Nizar General Maintenance',
    profession: 'صيانة عامة',
    professionEn: 'General Maintenance',
    professionCategory: 'general',
    rating: 4.6,
    reviews: 55,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999888999',
    location: 'الضاحية',
    experience: '8 سنوات',
    featured: true
  },
  {
    id: '7',
    name: 'كريم الكهربائي',
    nameEn: 'Karim Electrician',
    profession: 'كهربائي',
    professionEn: 'Electrician',
    professionCategory: 'electrician',
    rating: 4.7,
    reviews: 98,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999444555',
    location: 'الضاحية - الحي الجنوبي',
    experience: '9 سنوات'
  },
  {
    id: '8',
    name: 'طارق السباك',
    nameEn: 'Tariq Plumber',
    profession: 'سباك',
    professionEn: 'Plumber',
    professionCategory: 'plumber',
    rating: 4.6,
    reviews: 72,
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    ],
    available: true,
    phone: '0999111222',
    location: 'الضاحية',
    experience: '6 سنوات'
  }
];

const dataByRegion: Record<Region, Craftsman[]> = {
  'qudsaya-center': qudsayaCenterCraftsmen,
  'qudsaya-dahia': qudsayaDahiaCraftsmen
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Wrench },
  { id: 'electrician', name: 'كهربائيين', nameEn: 'Electricians', icon: Zap },
  { id: 'plumber', name: 'سباكين', nameEn: 'Plumbers', icon: Droplets },
  { id: 'carpenter', name: 'نجارين', nameEn: 'Carpenters', icon: Hammer },
  { id: 'painter', name: 'دهانين', nameEn: 'Painters', icon: Paintbrush },
  { id: 'ac', name: 'تكييف', nameEn: 'AC Technicians', icon: Settings },
];

export default function Craftsmen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const craftsmen = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCraftsmen = craftsmen.filter(craftsman => {
    return activeCategory === 'all' || craftsman.professionCategory === activeCategory;
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
  }, [filteredCraftsmen]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Card width + gap
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

  const nextImage = (craftsmanId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [craftsmanId]: ((prev[craftsmanId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (craftsmanId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [craftsmanId]: ((prev[craftsmanId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <section className="py-4 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl shadow-lg shadow-stone-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الحرفيين' : 'Craftsmen'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredCraftsmen.length} حرفي في ${regionName}` : `${filteredCraftsmen.length} craftsmen in ${regionName}`}
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
              ? craftsmen.length 
              : craftsmen.filter(c => c.professionCategory === filter.id).length;
            
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

        {/* تلميح للمستخدم */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredCraftsmen.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-stone-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Container - محسن */}
        <div className="relative">
          {/* Left Navigation Button - دائم */}
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

          {/* Right Navigation Button - دائم */}
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

          {/* Scrollable Cards Container - مع clip parcial */}
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
            {filteredCraftsmen.map((craftsman, index) => {
              const isFavorite = favorites.includes(craftsman.id);
              const imageIndex = currentImageIndex[craftsman.id] || 0;
              
              return (
                <div
                  key={craftsman.id}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img 
                      src={craftsman.images[imageIndex]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Image Navigation */}
                    {craftsman.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(craftsman.id, craftsman.images.length); }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(craftsman.id, craftsman.images.length); }}
                          className="absolute left-auto right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {craftsman.images.map((_, idx) => (
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
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(craftsman.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Available Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        craftsman.available ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {craftsman.available ? (isArabic ? 'متاح' : 'Available') : (isArabic ? 'مشغول' : 'Busy')}
                      </span>
                    </div>

                    {/* Verified/Featured Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {craftsman.verified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </span>
                      )}
                      {craftsman.featured && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Craftsman Info */}
                  <div className="px-1">
                    {/* Profession Badge */}
                    <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full font-medium">
                      {isArabic ? craftsman.profession : craftsman.professionEn}
                    </span>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-gray-900 mt-1 mb-0.5 line-clamp-1">
                      {isArabic ? craftsman.name : craftsman.nameEn}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-900">{craftsman.rating}</span>
                      <span className="text-[10px] text-gray-400">({craftsman.reviews})</span>
                    </div>

                    {/* Location & Experience */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{craftsman.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{craftsman.experience}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${craftsman.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-stone-600 hover:bg-stone-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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

        {/* Empty State */}
        {filteredCraftsmen.length === 0 && (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              {isArabic ? 'لا يوجد حرفيين بهذا التصنيف' : 'No craftsmen in this category'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
