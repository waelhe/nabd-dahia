'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Sparkles, Heart, ChevronLeft, ChevronRight, Music, Trophy, Palette, Utensils, Briefcase, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Event {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  locationEn: string;
  attendees: number;
  image: string;
  type: 'concert' | 'sports' | 'cultural' | 'food' | 'business' | 'festival';
  typeAr: string;
  typeEn: string;
  featured?: boolean;
  trending?: boolean;
  price?: string;
  priceEn?: string;
}

const qudsayaCenterEvents: Event[] = [
  {
    id: '1',
    title: 'مهرجان الربيع الثقافي',
    titleEn: 'Spring Cultural Festival',
    date: '25 مارس 2025',
    time: '4:00 مساءً',
    location: 'ساحة قدسيا',
    locationEn: 'Qudsaya Square',
    attendees: 300,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
    type: 'festival',
    typeAr: 'مهرجان',
    typeEn: 'Festival',
    featured: true,
    price: 'مجاني',
    priceEn: 'Free'
  },
  {
    id: '2',
    title: 'بطولة كرة القدم',
    titleEn: 'Football Championship',
    date: '27 مارس 2025',
    time: '5:00 مساءً',
    location: 'ملعب قدسيا',
    locationEn: 'Qudsaya Stadium',
    attendees: 600,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    type: 'sports',
    typeAr: 'رياضة',
    typeEn: 'Sports',
    trending: true,
    price: '5,000 ل.س',
    priceEn: '5,000 SYP'
  },
  {
    id: '3',
    title: 'حفل موسيقي للفنان الكبير',
    titleEn: 'Concert by Famous Artist',
    date: '30 مارس 2025',
    time: '8:00 مساءً',
    location: 'مسرح قدسيا',
    locationEn: 'Qudsaya Theater',
    attendees: 450,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80',
    type: 'concert',
    typeAr: 'حفل',
    typeEn: 'Concert',
    featured: true,
    price: '15,000 ل.س',
    priceEn: '15,000 SYP'
  },
  {
    id: '4',
    title: 'معرض الفن التشكيلي',
    titleEn: 'Art Exhibition',
    date: '1 أبريل 2025',
    time: '10:00 صباحاً',
    location: 'غاليري قدسيا',
    locationEn: 'Qudsaya Gallery',
    attendees: 120,
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?auto=format&fit=crop&w=600&q=80',
    type: 'cultural',
    typeAr: 'ثقافة',
    typeEn: 'Cultural',
    price: 'مجاني',
    priceEn: 'Free'
  },
  {
    id: '5',
    title: 'مهرجان الطعام السوري',
    titleEn: 'Syrian Food Festival',
    date: '5 أبريل 2025',
    time: '12:00 ظهراً',
    location: 'ساحة قدسيا',
    locationEn: 'Qudsaya Square',
    attendees: 500,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    type: 'food',
    typeAr: 'طعام',
    typeEn: 'Food',
    trending: true,
    price: 'دخول مجاني',
    priceEn: 'Free Entry'
  },
  {
    id: '6',
    title: 'مؤتمر ريادة الأعمال',
    titleEn: 'Entrepreneurship Conference',
    date: '10 أبريل 2025',
    time: '9:00 صباحاً',
    location: 'مركز قدسيا',
    locationEn: 'Qudsaya Center',
    attendees: 200,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    type: 'business',
    typeAr: 'أعمال',
    typeEn: 'Business',
    featured: true,
    price: '10,000 ل.س',
    priceEn: '10,000 SYP'
  },
  {
    id: '7',
    title: 'حفل سمر وشعر',
    titleEn: 'Poetry Night',
    date: '15 أبريل 2025',
    time: '7:00 مساءً',
    location: 'مقهى الورود',
    locationEn: 'Al Ward Cafe',
    attendees: 80,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    type: 'cultural',
    typeAr: 'ثقافة',
    typeEn: 'Cultural',
    price: '2,000 ل.س',
    priceEn: '2,000 SYP'
  },
  {
    id: '8',
    title: 'بطولة كرة السلة',
    titleEn: 'Basketball Championship',
    date: '20 أبريل 2025',
    time: '6:00 مساءً',
    location: 'صالة قدسيا',
    locationEn: 'Qudsaya Hall',
    attendees: 350,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    type: 'sports',
    typeAr: 'رياضة',
    typeEn: 'Sports',
    price: '3,000 ل.س',
    priceEn: '3,000 SYP'
  }
];

const qudsayaDahiaEvents: Event[] = [
  {
    id: '1',
    title: 'مهرجان الربيع الثقافي',
    titleEn: 'Spring Cultural Festival',
    date: '25 مارس 2025',
    time: '4:00 مساءً',
    location: 'ساحة الضاحية',
    locationEn: 'Dahia Square',
    attendees: 250,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
    type: 'festival',
    typeAr: 'مهرجان',
    typeEn: 'Festival',
    featured: true,
    price: 'مجاني',
    priceEn: 'Free'
  },
  {
    id: '2',
    title: 'بطولة كرة القدم',
    titleEn: 'Football Championship',
    date: '27 مارس 2025',
    time: '5:00 مساءً',
    location: 'ملعب الضاحية',
    locationEn: 'Dahia Stadium',
    attendees: 500,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    type: 'sports',
    typeAr: 'رياضة',
    typeEn: 'Sports',
    trending: true,
    price: '5,000 ل.س',
    priceEn: '5,000 SYP'
  },
  {
    id: '3',
    title: 'سهرة فنية مميزة',
    titleEn: 'Special Music Night',
    date: '29 مارس 2025',
    time: '9:00 مساءً',
    location: 'نادي الضاحية',
    locationEn: 'Dahia Club',
    attendees: 300,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    type: 'concert',
    typeAr: 'حفل',
    typeEn: 'Concert',
    featured: true,
    price: '12,000 ل.س',
    priceEn: '12,000 SYP'
  },
  {
    id: '4',
    title: 'ورشة الفنون التشكيلية',
    titleEn: 'Art Workshop',
    date: '2 أبريل 2025',
    time: '11:00 صباحاً',
    location: 'مركز الضاحية',
    locationEn: 'Dahia Center',
    attendees: 50,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80',
    type: 'cultural',
    typeAr: 'ثقافة',
    typeEn: 'Cultural',
    price: '3,000 ل.س',
    priceEn: '3,000 SYP'
  },
  {
    id: '5',
    title: 'مأدبة الطعام الشرقي',
    titleEn: 'Eastern Food Feast',
    date: '6 أبريل 2025',
    time: '1:00 ظهراً',
    location: 'مطعم الضاحية',
    locationEn: 'Dahia Restaurant',
    attendees: 150,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    type: 'food',
    typeAr: 'طعام',
    typeEn: 'Food',
    trending: true,
    price: '8,000 ل.س',
    priceEn: '8,000 SYP'
  },
  {
    id: '6',
    title: 'منتدى الأعمال السنوي',
    titleEn: 'Annual Business Forum',
    date: '12 أبريل 2025',
    time: '10:00 صباحاً',
    location: 'فندق الضاحية',
    locationEn: 'Dahia Hotel',
    attendees: 180,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    type: 'business',
    typeAr: 'أعمال',
    typeEn: 'Business',
    featured: true,
    price: '15,000 ل.س',
    priceEn: '15,000 SYP'
  },
  {
    id: '7',
    title: 'أمسية شعر وأدب',
    titleEn: 'Poetry & Literature Night',
    date: '18 أبريل 2025',
    time: '6:30 مساءً',
    location: 'مكتبة الضاحية',
    locationEn: 'Dahia Library',
    attendees: 60,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
    type: 'cultural',
    typeAr: 'ثقافة',
    typeEn: 'Cultural',
    price: 'مجاني',
    priceEn: 'Free'
  },
  {
    id: '8',
    title: 'سباق الجري السنوي',
    titleEn: 'Annual Running Race',
    date: '22 أبريل 2025',
    time: '7:00 صباحاً',
    location: 'شوارع الضاحية',
    locationEn: 'Dahia Streets',
    attendees: 400,
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80',
    type: 'sports',
    typeAr: 'رياضة',
    typeEn: 'Sports',
    price: '1,000 ل.س',
    priceEn: '1,000 SYP'
  }
];

const dataByRegion: Record<Region, Event[]> = {
  'qudsaya-center': qudsayaCenterEvents,
  'qudsaya-dahia': qudsayaDahiaEvents
};

const eventTypeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Sparkles },
  { id: 'concert', name: 'حفلات', nameEn: 'Concerts', icon: Music },
  { id: 'sports', name: 'رياضة', nameEn: 'Sports', icon: Trophy },
  { id: 'cultural', name: 'ثقافة', nameEn: 'Cultural', icon: Palette },
  { id: 'food', name: 'طعام', nameEn: 'Food', icon: Utensils },
  { id: 'business', name: 'أعمال', nameEn: 'Business', icon: Briefcase },
  { id: 'festival', name: 'مهرجانات', nameEn: 'Festivals', icon: PartyPopper },
];

export default function Events() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const events = dataByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = events.filter(event => {
    return activeType === 'all' || event.type === activeType;
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
  }, [filteredEvents]);

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

  return (
    <section className="py-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الفعاليات القادمة' : 'Upcoming Events'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredEvents.length} فعالية في ${regionName}` : `${filteredEvents.length} events in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Event Type Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {eventTypeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.id;
            const count = filter.id === 'all'
              ? events.length
              : events.filter(e => e.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredEvents.slice(0, 8).map((_, idx) => (
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
          {/* Left Navigation Button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollLeft
                ? 'opacity-100 hover:scale-110 hover:bg-purple-50'
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
                ? 'opacity-100 hover:scale-110 hover:bg-purple-50 animate-pulse'
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
            {filteredEvents.map((event, index) => {
              const isFavorite = favorites.includes(event.id);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-gray-200 hover:shadow-xl overflow-hidden group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Event Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-600 text-white">
                        {isArabic ? event.typeAr : event.typeEn}
                      </span>
                    </div>

                    {/* Featured/Trending Badge */}
                    {(event.featured || event.trending) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          event.featured ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-white/90 text-purple-600'
                        }`}>
                          {event.featured
                            ? (isArabic ? 'مميز' : 'Featured')
                            : (isArabic ? 'رائج' : 'Trending')}
                        </span>
                      </div>
                    )}

                    {/* Title on Image */}
                    <div className="absolute bottom-2 left-2 right-14">
                      <h3 className="text-sm font-bold text-white line-clamp-2">
                        {isArabic ? event.title : event.titleEn}
                      </h3>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-3">
                    {/* Date and Time */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <span className="line-clamp-1">{isArabic ? event.location : event.locationEn}</span>
                    </div>

                    {/* Footer: Attendees and Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span>{event.attendees}+ {isArabic ? 'حاضر' : 'attending'}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {isArabic ? event.price : event.priceEn}
                      </span>
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
