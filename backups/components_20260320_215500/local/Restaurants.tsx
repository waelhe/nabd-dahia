'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UtensilsCrossed, MapPin, Star, Clock, Flame, ChefHat, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  isOpen: boolean;
  featured?: boolean;
  new?: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaRestaurants: Restaurant[] = [
  {
    id: 'd1',
    name: 'مطعم الشام - ضاحية قدسيا',
    nameEn: 'Al-Sham Restaurant - Qudsaya Dahia',
    cuisine: 'شامي',
    rating: 4.8,
    deliveryTime: '30-45',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    featured: true
  },
  {
    id: 'd2',
    name: 'بيتزا الضاحية',
    nameEn: 'Dahia Pizza',
    cuisine: 'بيتزا',
    rating: 4.5,
    deliveryTime: '25-35',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    new: true
  },
  {
    id: 'd3',
    name: 'مشاوي البيك',
    nameEn: 'Al-Baik Grills',
    cuisine: 'مشاوي',
    rating: 4.9,
    deliveryTime: '20-30',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    featured: true
  },
  {
    id: 'd4',
    name: 'كافيه النخيل',
    nameEn: 'Palm Cafe',
    cuisine: 'حلويات',
    rating: 4.6,
    deliveryTime: '15-25',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
    isOpen: true
  },
  {
    id: 'd5',
    name: 'سندويشات الساحة',
    nameEn: 'Square Sandwiches',
    cuisine: 'سندويشات',
    rating: 4.7,
    deliveryTime: '15-20',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    new: true
  },
  {
    id: 'd6',
    name: 'مطعم السياحة',
    nameEn: 'Tourism Restaurant',
    cuisine: 'عربي',
    rating: 4.4,
    deliveryTime: '30-40',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    isOpen: true
  }
];

// بيانات قدسيا المركز
const qudsayaCenterRestaurants: Restaurant[] = [
  {
    id: 'c1',
    name: 'مطعم القدس',
    nameEn: 'Al-Quds Restaurant',
    cuisine: 'شامي',
    rating: 4.7,
    deliveryTime: '25-40',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    featured: true
  },
  {
    id: 'c2',
    name: 'بيتزا الجبل',
    nameEn: 'Mountain Pizza',
    cuisine: 'بيتزا',
    rating: 4.6,
    deliveryTime: '30-40',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    new: true
  },
  {
    id: 'c3',
    name: 'مشاوي الصفاء',
    nameEn: 'Al-Safa Grills',
    cuisine: 'مشاوي',
    rating: 4.8,
    deliveryTime: '20-35',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    featured: true
  },
  {
    id: 'c4',
    name: 'كافيه الجبل',
    nameEn: 'Mountain Cafe',
    cuisine: 'حلويات',
    rating: 4.5,
    deliveryTime: '15-25',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
    isOpen: true
  },
  {
    id: 'c5',
    name: 'مأكولات البحر',
    nameEn: 'Seafood Kitchen',
    cuisine: 'بحري',
    rating: 4.9,
    deliveryTime: '35-45',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=600&q=80',
    isOpen: true
  },
  {
    id: 'c6',
    name: 'بوفيه الشرق',
    nameEn: 'East Buffet',
    cuisine: 'بوفيه',
    rating: 4.3,
    deliveryTime: '40-50',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    isOpen: true
  }
];

const restaurantsByRegion: Record<Region, Restaurant[]> = {
  'qudsaya-center': qudsayaCenterRestaurants,
  'qudsaya-dahia': qudsayaDahiaRestaurants
};

const cuisineFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: ChefHat },
  { id: 'شامي', name: 'شامي', nameEn: 'Levantine', icon: UtensilsCrossed },
  { id: 'بيتزا', name: 'بيتزا', nameEn: 'Pizza', icon: UtensilsCrossed },
  { id: 'مشاوي', name: 'مشاوي', nameEn: 'Grills', icon: Flame },
];

export default function Restaurants() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const restaurants = restaurantsByRegion[region];
  
  const [activeCuisine, setActiveCuisine] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRestaurants = restaurants.filter(r => 
    activeCuisine === 'all' || r.cuisine === activeCuisine
  );

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
  }, [filteredRestaurants]);

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
    <section id="restaurants" className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-200">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المطاعم والمأكولات' : 'Restaurants & Food'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredRestaurants.length} مطعم في ${regionName}` : `${filteredRestaurants.length} restaurants in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Cuisine Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {cuisineFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCuisine === filter.id;
            const count = filter.id === 'all' 
              ? restaurants.length 
              : restaurants.filter(r => r.cuisine === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCuisine(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-orange-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredRestaurants.slice(0, 6).map((_, idx) => (
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
            {filteredRestaurants.map((restaurant, index) => {
              const isFavorite = favorites.includes(restaurant.id);
              
              return (
                <div
                  key={restaurant.id}
                  className="flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={restaurant.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Status Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {restaurant.isOpen ? (isArabic ? 'مفتوح' : 'Open') : (isArabic ? 'مغلق' : 'Closed')}
                    </span>

                    {/* Cuisine Badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 text-gray-700 text-[10px] font-bold rounded-full">
                      {restaurant.cuisine}
                    </span>

                    {/* Featured/New Badge */}
                    {(restaurant.featured || restaurant.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          restaurant.featured ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {restaurant.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? restaurant.name : restaurant.nameEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-900">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <span>{restaurant.deliveryTime} {isArabic ? 'دقيقة' : 'min'}</span>
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
