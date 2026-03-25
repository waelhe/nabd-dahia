'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Star, Heart, TreePine, Landmark, Building2, Camera, Church, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Place {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  rating: number;
  image: string;
  description: string;
  descriptionEn: string;
  featured?: boolean;
  new?: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaPlaces: Place[] = [
  {
    id: 'd1',
    name: 'حديقة ضاحية قدسيا',
    nameEn: 'Qudsaya Dahia Park',
    type: 'حدائق',
    typeEn: 'Parks',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
    description: 'حديقة كبيرة مع ملاعب أطفال',
    descriptionEn: 'Large park with playgrounds',
    featured: true
  },
  {
    id: 'd2',
    name: 'نادي الضاحية الرياضية',
    nameEn: 'Dahia Sports Club',
    type: 'معالم',
    typeEn: 'Attractions',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
    description: 'نادي رياضي متكامل',
    descriptionEn: 'Complete sports club',
    new: true
  },
  {
    id: 'd3',
    name: 'سوق الضاحية الشعبي',
    nameEn: 'Dahia Popular Market',
    type: 'أسواق',
    typeEn: 'Markets',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1598892550437-0784ad7f36a6?auto=format&fit=crop&w=600&q=80',
    description: 'سوق شعبي متنوع',
    descriptionEn: 'Diverse popular market'
  },
  {
    id: 'd4',
    name: 'جامع الضاحية الكبير',
    nameEn: 'Grand Dahia Mosque',
    type: 'معالم دينية',
    typeEn: 'Religious Sites',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
    description: 'مسجد كبير وجامع',
    descriptionEn: 'Large and grand mosque',
    featured: true
  },
  {
    id: 'd5',
    name: 'مطعم الوادي',
    nameEn: 'Al Wadi Restaurant',
    type: 'سياحة',
    typeEn: 'Tourism',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    description: 'مطعم فاخر بإطلالة طبيعية',
    descriptionEn: 'Fancy restaurant with natural views',
    new: true
  },
  {
    id: 'd6',
    name: 'ملعب الأطفال الترفيهي',
    nameEn: 'Kids Entertainment Playground',
    type: 'حدائق',
    typeEn: 'Parks',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?auto=format&fit=crop&w=600&q=80',
    description: 'ملعب ترفيهي للأطفال',
    descriptionEn: 'Entertainment playground for kids'
  }
];

// بيانات قدسيا المركز
const qudsayaCenterPlaces: Place[] = [
  {
    id: 'c1',
    name: 'حديقة قدسيا المركزية',
    nameEn: 'Qudsaya Central Park',
    type: 'حدائق',
    typeEn: 'Parks',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
    description: 'حديقة خلابة مع إطلالة جبلية',
    descriptionEn: 'Beautiful park with mountain views',
    featured: true
  },
  {
    id: 'c2',
    name: 'قلعة قدسيا التاريخية',
    nameEn: 'Historic Qudsaya Castle',
    type: 'معالم سياحية',
    typeEn: 'Attractions',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=600&q=80',
    description: 'معلم تاريخي قديم',
    descriptionEn: 'Ancient historical landmark',
    featured: true
  },
  {
    id: 'c3',
    name: 'سوق قدسيا الشعبي',
    nameEn: 'Qudsaya Popular Market',
    type: 'أسواق',
    typeEn: 'Markets',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1598892550437-0784ad7f36a6?auto=format&fit=crop&w=600&q=80',
    description: 'سوق تقليدي بمنتجات محلية',
    descriptionEn: 'Traditional market with local products'
  },
  {
    id: 'c4',
    name: 'جامع قدسيا الكبير',
    nameEn: 'Grand Qudsaya Mosque',
    type: 'معالم دينية',
    typeEn: 'Religious Sites',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
    description: 'مسجد تاريخي',
    descriptionEn: 'Historic mosque'
  },
  {
    id: 'c5',
    name: 'مقهى الساحة',
    nameEn: 'Square Café',
    type: 'سياحة',
    typeEn: 'Tourism',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    description: 'مقهى عصري في الساحة الرئيسية',
    descriptionEn: 'Modern café in the main square',
    new: true
  },
  {
    id: 'c6',
    name: 'كنيسة العذراء',
    nameEn: 'Church of the Virgin',
    type: 'معالم دينية',
    typeEn: 'Religious Sites',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=600&q=80',
    description: 'كنيسة تاريخية قديمة',
    descriptionEn: 'Ancient historic church',
    featured: true
  }
];

const placesByRegion: Record<Region, Place[]> = {
  'qudsaya-center': qudsayaCenterPlaces,
  'qudsaya-dahia': qudsayaDahiaPlaces
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: MapPin },
  { id: 'حدائق', name: 'حدائق', nameEn: 'Parks', icon: TreePine },
  { id: 'معالم', name: 'معالم', nameEn: 'Attractions', icon: Landmark },
  { id: 'معالم سياحية', name: 'معالم سياحية', nameEn: 'Tourist Attractions', icon: Camera },
  { id: 'أسواق', name: 'أسواق', nameEn: 'Markets', icon: ShoppingBag },
  { id: 'معالم دينية', name: 'معالم دينية', nameEn: 'Religious', icon: Church },
  { id: 'سياحة', name: 'سياحة', nameEn: 'Tourism', icon: Camera },
];

export default function Places() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const places = placesByRegion[region];

  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredPlaces = places.filter(place => {
    return activeCategory === 'all' || place.type === activeCategory || place.typeEn === activeCategory;
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
    <section className="py-6 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-200">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المعالم' : 'Landmarks'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredPlaces.length} مكان في ${regionName}` : `${filteredPlaces.length} places in ${regionName}`}
              </p>
            </div>
          </div>

          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters - Horizontal Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all'
              ? places.length
              : places.filter(p => p.type === filter.id || p.typeEn === filter.id).length;

            if (count === 0 && filter.id !== 'all') return null;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                    : 'bg-white text-gray-600 hover:bg-teal-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-teal-100' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Swipe Hint */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>👈</span>
            <span>{isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}</span>
          </p>
          <div className="flex gap-1">
            {filteredPlaces.slice(0, 8).map((_, idx) => (
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
                ? 'opacity-100 hover:scale-110 hover:bg-teal-50'
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
                ? 'opacity-100 hover:scale-110 hover:bg-teal-50 animate-pulse'
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
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative h-[200px] rounded-2xl overflow-hidden mb-2">
                    <img
                      src={place.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
                      <span className="px-2 py-1 bg-white/90 text-gray-700 text-[10px] font-bold rounded-full shadow-sm">
                        {isArabic ? place.type : place.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    {(place.featured || place.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          place.featured
                            ? 'bg-teal-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}>
                          {place.featured
                            ? (isArabic ? 'مميز' : 'Featured')
                            : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-900">{place.rating}</span>
                    </div>
                  </div>

                  {/* Place Info */}
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? place.name : place.nameEn}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {isArabic ? place.description : place.descriptionEn}
                    </p>
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
