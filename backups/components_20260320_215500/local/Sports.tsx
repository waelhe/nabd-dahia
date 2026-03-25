'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Dumbbell, Trophy, MapPin, Users, Clock, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Sport {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  image: string;
  facilities: string[];
  facilitiesEn: string[];
}

const qudsayaCenterSports: Sport[] = [
  {
    id: '1',
    name: 'نادي قدسيا الرياضي',
    nameEn: 'Qudsaya Sports Club',
    type: 'نادي رياضي',
    typeEn: 'Sports Club',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
    facilities: ['كرة قدم', 'سباحة', 'تنس'],
    facilitiesEn: ['Football', 'Swimming', 'Tennis']
  },
  {
    id: '2',
    name: 'صالة اللياقة البدنية',
    nameEn: 'Fitness Gym',
    type: 'نادي لياقة',
    typeEn: 'Gym',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    facilities: ['أجهزة حديثة', 'مدربين', 'ساونا'],
    facilitiesEn: ['Modern Equipment', 'Trainers', 'Sauna']
  },
  {
    id: '3',
    name: 'ملاعب كرة القدم',
    nameEn: 'Football Fields',
    type: 'ملاعب',
    typeEn: 'Fields',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    facilities: ['عشب صناعي', 'إضاءة ليلية'],
    facilitiesEn: ['Artificial Grass', 'Night Lighting']
  },
  {
    id: '4',
    name: 'مركز السباحة',
    nameEn: 'Swimming Center',
    type: 'سباحة',
    typeEn: 'Swimming',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
    facilities: ['مساحة كبيرة', 'دروس سباحة'],
    facilitiesEn: ['Large Pool', 'Swimming Lessons']
  },
  {
    id: '5',
    name: 'نادي الكاراتيه',
    nameEn: 'Karate Club',
    type: 'نادي رياضي',
    typeEn: 'Sports Club',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80',
    facilities: ['مدرب محترف', 'أحزمة ملونة'],
    facilitiesEn: ['Professional Trainer', 'Colored Belts']
  }
];

const qudsayaDahiaSports: Sport[] = [
  {
    id: '1',
    name: 'نادي الضاحية الرياضي',
    nameEn: 'Dahia Sports Club',
    type: 'نادي رياضي',
    typeEn: 'Sports Club',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
    facilities: ['كرة قدم', 'سباحة', 'تنس'],
    facilitiesEn: ['Football', 'Swimming', 'Tennis']
  },
  {
    id: '2',
    name: 'صالة اللياقة البدنية',
    nameEn: 'Fitness Gym',
    type: 'نادي لياقة',
    typeEn: 'Gym',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    facilities: ['أجهزة حديثة', 'مدربين', 'ساونا'],
    facilitiesEn: ['Modern Equipment', 'Trainers', 'Sauna']
  },
  {
    id: '3',
    name: 'ملاعب كرة القدم',
    nameEn: 'Football Fields',
    type: 'ملاعب',
    typeEn: 'Fields',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    facilities: ['عشب صناعي', 'إضاءة ليلية'],
    facilitiesEn: ['Artificial Grass', 'Night Lighting']
  },
  {
    id: '4',
    name: 'مركز السباحة',
    nameEn: 'Swimming Center',
    type: 'سباحة',
    typeEn: 'Swimming',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
    facilities: ['مساحة كبيرة', 'دروس سباحة'],
    facilitiesEn: ['Large Pool', 'Swimming Lessons']
  },
  {
    id: '5',
    name: 'نادي التنس',
    nameEn: 'Tennis Club',
    type: 'نادي رياضي',
    typeEn: 'Sports Club',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
    facilities: ['ملاعب خارجية', 'ملاعب داخلية'],
    facilitiesEn: ['Outdoor Courts', 'Indoor Courts']
  }
];

const dataByRegion: Record<Region, Sport[]> = {
  'qudsaya-center': qudsayaCenterSports,
  'qudsaya-dahia': qudsayaDahiaSports
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Trophy },
  { id: 'نادي رياضي', name: 'أندية', nameEn: 'Clubs', icon: Dumbbell },
  { id: 'نادي لياقة', name: 'لياقة', nameEn: 'Gym', icon: Flame },
  { id: 'ملاعب', name: 'ملاعب', nameEn: 'Fields', icon: Trophy },
  { id: 'سباحة', name: 'سباحة', nameEn: 'Swimming', icon: Users },
];

export default function Sports() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const sports = dataByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredSports = sports.filter(s => 
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
  }, [filteredSports]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'مراكز رياضية' : 'Sports Centers'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredSports.length} مكان في ${regionName}` : `${filteredSports.length} places in ${regionName}`}
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
              ? sports.length 
              : sports.filter(s => s.type === filter.id).length;
            
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
            {filteredSports.slice(0, 5).map((_, idx) => (
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
            {filteredSports.map((sport, index) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                  <img 
                    src={sport.image} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Type Badge */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                    {isArabic ? sport.type : sport.typeEn}
                  </span>
                </div>

                {/* Info */}
                <div className="px-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                    {isArabic ? sport.name : sport.nameEn}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {(isArabic ? sport.facilities : sport.facilitiesEn).slice(0, 2).map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        {f}
                      </span>
                    ))}
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
