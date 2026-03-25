'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, Clock, Calendar, ChevronLeft, ChevronRight, Stethoscope, Baby, Smile, Sparkles, Activity, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

interface Doctor {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
  specialtyCategory: 'general' | 'pediatrics' | 'dentistry' | 'dermatology' | 'gynecology' | 'cardiology';
  rating: number;
  reviews: number;
  nextAvailable: string;
  image: string;
  isAvailable: boolean;
  featured?: boolean;
  new?: boolean;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaDoctors: Doctor[] = [
  {
    id: '1',
    name: 'د. أحمد العمري',
    nameEn: 'Dr. Ahmed Al-Omari',
    specialty: 'طب عام',
    specialtyEn: 'General Medicine',
    specialtyCategory: 'general',
    rating: 4.9,
    reviews: 156,
    nextAvailable: '10:00 ص',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    featured: true
  },
  {
    id: '2',
    name: 'د. سارة الخالد',
    nameEn: 'Dr. Sara Al-Khaled',
    specialty: 'طب أطفال',
    specialtyEn: 'Pediatrics',
    specialtyCategory: 'pediatrics',
    rating: 4.8,
    reviews: 98,
    nextAvailable: '11:30 ص',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    new: true
  },
  {
    id: '3',
    name: 'د. محمد العلي',
    nameEn: 'Dr. Mohammad Al-Ali',
    specialty: 'طب أسنان',
    specialtyEn: 'Dentistry',
    specialtyCategory: 'dentistry',
    rating: 4.7,
    reviews: 124,
    nextAvailable: '2:00 م',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: '4',
    name: 'د. ليلى حسن',
    nameEn: 'Dr. Laila Hassan',
    specialty: 'أمراض جلدية',
    specialtyEn: 'Dermatology',
    specialtyCategory: 'dermatology',
    rating: 4.6,
    reviews: 87,
    nextAvailable: '4:00 م',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    featured: true
  },
  {
    id: '5',
    name: 'د. خالد المحمود',
    nameEn: 'Dr. Khaled Al-Mahmoud',
    specialty: 'طب قلب',
    specialtyEn: 'Cardiology',
    specialtyCategory: 'cardiology',
    rating: 4.9,
    reviews: 201,
    nextAvailable: '9:00 ص',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    new: true
  },
  {
    id: '6',
    name: 'د. نورا الأحمد',
    nameEn: 'Dr. Noura Al-Ahmad',
    specialty: 'طب نسائية',
    specialtyEn: 'Gynecology',
    specialtyCategory: 'gynecology',
    rating: 4.8,
    reviews: 178,
    nextAvailable: '1:30 م',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  }
];

// بيانات قدسيا المركز
const qudsayaCenterDoctors: Doctor[] = [
  {
    id: 'q1',
    name: 'د. محمود القدسي',
    nameEn: 'Dr. Mahmoud Al-Qudsi',
    specialty: 'طب عام',
    specialtyEn: 'General Medicine',
    specialtyCategory: 'general',
    rating: 4.8,
    reviews: 134,
    nextAvailable: '9:30 ص',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'q2',
    name: 'د. نورة الأحمد',
    nameEn: 'Dr. Noura Al-Ahmad',
    specialty: 'طب أطفال',
    specialtyEn: 'Pediatrics',
    specialtyCategory: 'pediatrics',
    rating: 4.9,
    reviews: 167,
    nextAvailable: '10:00 ص',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    featured: true
  },
  {
    id: 'q3',
    name: 'د. خالد المحمود',
    nameEn: 'Dr. Khaled Al-Mahmoud',
    specialty: 'طب أسنان',
    specialtyEn: 'Dentistry',
    specialtyCategory: 'dentistry',
    rating: 4.7,
    reviews: 89,
    nextAvailable: '1:00 م',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    new: true
  },
  {
    id: 'q4',
    name: 'د. رنا السيد',
    nameEn: 'Dr. Rana Al-Sayed',
    specialty: 'طب نسائية',
    specialtyEn: 'Gynecology',
    specialtyCategory: 'gynecology',
    rating: 4.8,
    reviews: 145,
    nextAvailable: '3:30 م',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    featured: true
  },
  {
    id: 'q5',
    name: 'د. فاطمة الزهراء',
    nameEn: 'Dr. Fatima Al-Zahra',
    specialty: 'أمراض جلدية',
    specialtyEn: 'Dermatology',
    specialtyCategory: 'dermatology',
    rating: 4.6,
    reviews: 76,
    nextAvailable: '11:00 ص',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'q6',
    name: 'د. حسن الكردي',
    nameEn: 'Dr. Hassan Al-Kurdi',
    specialty: 'طب قلب',
    specialtyEn: 'Cardiology',
    specialtyCategory: 'cardiology',
    rating: 4.9,
    reviews: 198,
    nextAvailable: '2:30 م',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    new: true
  }
];

const doctorsByRegion: Record<Region, Doctor[]> = {
  'qudsaya-center': qudsayaCenterDoctors,
  'qudsaya-dahia': qudsayaDahiaDoctors
};

const specialtyFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Stethoscope },
  { id: 'general', name: 'طب عام', nameEn: 'General', icon: Activity },
  { id: 'pediatrics', name: 'أطفال', nameEn: 'Pediatrics', icon: Baby },
  { id: 'dentistry', name: 'أسنان', nameEn: 'Dentistry', icon: Smile },
  { id: 'dermatology', name: 'جلدية', nameEn: 'Dermatology', icon: Sparkles },
  { id: 'gynecology', name: 'نسائية', nameEn: 'Gynecology', icon: Users },
  { id: 'cardiology', name: 'قلب', nameEn: 'Cardiology', icon: Heart },
];

export default function Doctors() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const doctors = doctorsByRegion[region];

  const [activeSpecialty, setActiveSpecialty] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredDoctors = doctors.filter(doctor => {
    return activeSpecialty === 'all' || doctor.specialtyCategory === activeSpecialty;
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
  }, [filteredDoctors]);

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
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الأطباء والعيادات' : 'Doctors & Clinics'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredDoctors.length} طبيب في ${regionName}` : `${filteredDoctors.length} doctors in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Specialty Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {specialtyFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeSpecialty === filter.id;
            const count = filter.id === 'all' 
              ? doctors.length 
              : doctors.filter(d => d.specialtyCategory === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveSpecialty(filter.id)}
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

        {/* Swipe Hint */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredDoctors.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-rose-500 w-4' : 'bg-gray-300'
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
            {filteredDoctors.map((doctor, index) => {
              const isFavorite = favorites.includes(doctor.id);
              
              return (
                <div
                  key={doctor.id}
                  className="flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={doctor.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(doctor.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Availability Badge */}
                    {doctor.isAvailable && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          {isArabic ? 'متاح' : 'Available'}
                        </span>
                      </div>
                    )}

                    {/* Featured/New Badge */}
                    {(doctor.featured || doctor.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          doctor.featured ? 'bg-white/90 text-gray-900' : 'bg-rose-500 text-white'
                        }`}>
                          {doctor.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}

                    {/* Specialty Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-gray-700">
                        {isArabic ? doctor.specialty : doctor.specialtyEn}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="px-1">
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-900">{doctor.rating}</span>
                        <span className="text-[10px] text-gray-400">({doctor.reviews})</span>
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? doctor.name : doctor.nameEn}
                    </h3>

                    {/* Next Available Time */}
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      <span>{isArabic ? 'القادم:' : 'Next:'} {doctor.nextAvailable}</span>
                    </div>

                    {/* Book Button */}
                    <button className="w-full mt-2 py-1.5 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-bold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md">
                      {isArabic ? 'احجز موعد' : 'Book Appointment'}
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
