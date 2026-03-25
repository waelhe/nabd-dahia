'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Sparkles, Star, MapPin, Phone, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface BeautyPlace {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  rating: number;
  image: string;
  services: string[];
  servicesEn: string[];
  location: string;
  phone: string;
  featured?: boolean;
  new?: boolean;
}

const qudsayaCenterBeauty: BeautyPlace[] = [
  {
    id: '1',
    name: 'صالون الأناقة',
    nameEn: 'Elegance Salon',
    type: 'صالون نسائي',
    typeEn: 'Women\'s Salon',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    services: ['قص شعر', 'صبغة', 'مانيكير'],
    servicesEn: ['Haircut', 'Dye', 'Manicure'],
    location: 'قدسيا - الحي الرئيسي',
    phone: '0999123456',
    featured: true
  },
  {
    id: '2',
    name: 'حلاق الفارس',
    nameEn: 'Al-Fares Barber',
    type: 'حلاقة رجالية',
    typeEn: 'Men\'s Barber',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    services: ['حلاقة', 'تقصير', 'حلاقة لحية'],
    servicesEn: ['Shave', 'Haircut', 'Beard'],
    location: 'قدسيا',
    phone: '0998765432',
    new: true
  },
  {
    id: '3',
    name: 'سبا الاسترخاء',
    nameEn: 'Relaxation Spa',
    type: 'مركز سبا',
    typeEn: 'Spa Center',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    services: ['مساج', 'ساونا', 'جاكوزي'],
    servicesEn: ['Massage', 'Sauna', 'Jacuzzi'],
    location: 'قدسيا - المركز',
    phone: '0111234567',
    featured: true
  },
  {
    id: '4',
    name: 'مركز التجميل',
    nameEn: 'Beauty Center',
    type: 'تجميل',
    typeEn: 'Beauty',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    services: ['مكياج', 'عناية بالبشرة', 'تنظيف'],
    servicesEn: ['Makeup', 'Skincare', 'Cleaning'],
    location: 'قدسيا',
    phone: '0997654321'
  },
  {
    id: '5',
    name: 'صالون النجوم',
    nameEn: 'Stars Salon',
    type: 'صالون نسائي',
    typeEn: 'Women\'s Salon',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=600&q=80',
    services: ['قص شعر', 'ستايل', 'علاج'],
    servicesEn: ['Haircut', 'Style', 'Treatment'],
    location: 'قدسيا - الحي الشرقي',
    phone: '0999345678',
    new: true
  },
  {
    id: '6',
    name: 'سبا الياسمين',
    nameEn: 'Jasmine Spa',
    type: 'مركز سبا',
    typeEn: 'Spa Center',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80',
    services: ['مساج', 'عناية', 'استرخاء'],
    servicesEn: ['Massage', 'Care', 'Relaxation'],
    location: 'قدسيا - الحي الغربي',
    phone: '0998456789',
    featured: true
  }
];

const qudsayaDahiaBeauty: BeautyPlace[] = [
  {
    id: '1',
    name: 'صالون الجمال',
    nameEn: 'Beauty Salon',
    type: 'صالون نسائي',
    typeEn: 'Women\'s Salon',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    services: ['قص شعر', 'صبغة', 'مانيكير'],
    servicesEn: ['Haircut', 'Dye', 'Manicure'],
    location: 'الضاحية - الحي الرئيسي',
    phone: '0999234567',
    featured: true
  },
  {
    id: '2',
    name: 'حلاق النجوم',
    nameEn: 'Stars Barber',
    type: 'حلاقة رجالية',
    typeEn: 'Men\'s Barber',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    services: ['حلاقة', 'تقصير', 'حلاقة لحية'],
    servicesEn: ['Shave', 'Haircut', 'Beard'],
    location: 'الضاحية',
    phone: '0998345678',
    new: true
  },
  {
    id: '3',
    name: 'سبا الراحة',
    nameEn: 'Comfort Spa',
    type: 'مركز سبا',
    typeEn: 'Spa Center',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    services: ['مساج', 'ساونا', 'جاكوزي'],
    servicesEn: ['Massage', 'Sauna', 'Jacuzzi'],
    location: 'الضاحية - المركز',
    phone: '0112345678',
    featured: true
  },
  {
    id: '4',
    name: 'مركز الأنوثة',
    nameEn: 'Femininity Center',
    type: 'تجميل',
    typeEn: 'Beauty',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    services: ['مكياج', 'عناية بالبشرة', 'تنظيف'],
    servicesEn: ['Makeup', 'Skincare', 'Cleaning'],
    location: 'الضاحية',
    phone: '0997456789'
  },
  {
    id: '5',
    name: 'حلاق الأناقة',
    nameEn: 'Elegance Barber',
    type: 'حلاقة رجالية',
    typeEn: 'Men\'s Barber',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
    services: ['حلاقة', 'حلاقة لحية', 'ستايل'],
    servicesEn: ['Shave', 'Beard', 'Style'],
    location: 'الضاحية - الحي الغربي',
    phone: '0999567890',
    new: true
  },
  {
    id: '6',
    name: 'سبا الورد',
    nameEn: 'Rose Spa',
    type: 'مركز سبا',
    typeEn: 'Spa Center',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80',
    services: ['مساج', 'جمال', 'استرخاء'],
    servicesEn: ['Massage', 'Beauty', 'Relaxation'],
    location: 'الضاحية - الحي الشرقي',
    phone: '0998678901'
  }
];

const dataByRegion: Record<Region, BeautyPlace[]> = {
  'qudsaya-center': qudsayaCenterBeauty,
  'qudsaya-dahia': qudsayaDahiaBeauty
};

const serviceFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All' },
  { id: 'salon', name: 'صالونات', nameEn: 'Salons' },
  { id: 'barber', name: 'حلاقين', nameEn: 'Barbers' },
  { id: 'spa', name: 'سبا', nameEn: 'Spa' },
  { id: 'beauty', name: 'تجميل', nameEn: 'Beauty' },
];

export default function Beauty() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const beautyPlaces = dataByRegion[region];
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter beauty places by type
  const filteredPlaces = beautyPlaces.filter(place => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'salon') return place.typeEn.includes('Salon');
    if (activeFilter === 'barber') return place.typeEn.includes('Barber');
    if (activeFilter === 'spa') return place.typeEn.includes('Spa');
    if (activeFilter === 'beauty') return place.typeEn === 'Beauty';
    return true;
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
  }, [filteredPlaces]);

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

  return (
    <section className="py-4 bg-gradient-to-b from-fuchsia-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl shadow-lg shadow-fuchsia-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'مراكز التجميل' : 'Beauty Centers'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredPlaces.length} مركز في ${regionName}` : `${filteredPlaces.length} places in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Service Type Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {serviceFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const count = filter.id === 'all' 
              ? beautyPlaces.length 
              : beautyPlaces.filter(p => {
                  if (filter.id === 'salon') return p.typeEn.includes('Salon');
                  if (filter.id === 'barber') return p.typeEn.includes('Barber');
                  if (filter.id === 'spa') return p.typeEn.includes('Spa');
                  if (filter.id === 'beauty') return p.typeEn === 'Beauty';
                  return false;
                }).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-fuchsia-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-fuchsia-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredPlaces.slice(0, 6).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-fuchsia-500 w-4' : 'bg-gray-300'
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

          {/* Scrollable Cards Container with Gradient Mask */}
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
            {filteredPlaces.map((place, index) => {
              const isFavorite = favorites.includes(place.id);
              
              return (
                <div
                  key={place.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={place.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-fuchsia-600 text-white">
                        {isArabic ? place.type : place.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    {(place.featured || place.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          place.featured ? 'bg-white/90 text-gray-900' : 'bg-emerald-500 text-white'
                        }`}>
                          {place.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute bottom-2 left-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-white">{place.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Place Info */}
                  <div className="px-1">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? place.name : place.nameEn}
                    </h3>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? place.services : place.servicesEn).slice(0, 3).map((service, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{place.location}</span>
                    </div>

                    {/* Book Button */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      {isArabic ? 'احجز موعد' : 'Book Now'}
                    </button>
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
