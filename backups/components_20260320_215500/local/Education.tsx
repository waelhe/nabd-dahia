'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, Star, Heart, ChevronLeft, ChevronRight, School, Building2, BookOpenCheck, Baby, GraduationCapIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface School {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  level: string;
  levelEn: string;
  students: number;
  rating: number;
  image: string;
  isEnrolling: boolean;
  category: 'school' | 'institute' | 'course' | 'kindergarten';
  featured?: boolean;
  new?: boolean;
}

const qudsayaCenterSchools: School[] = [
  {
    id: '1',
    name: 'مدرسة قدسيا النموذجية',
    nameEn: 'Qudsaya Model School',
    type: 'حكومية',
    typeEn: 'Public',
    level: 'ابتدائي - ثانوي',
    levelEn: 'Primary - Secondary',
    students: 900,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'school',
    featured: true
  },
  {
    id: '2',
    name: 'روضة قدسيا',
    nameEn: 'Qudsaya Kindergarten',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'رياض أطفال',
    levelEn: 'Kindergarten',
    students: 150,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'kindergarten',
    new: true
  },
  {
    id: '3',
    name: 'معهد اللغات - قدسيا',
    nameEn: 'Languages Institute - Qudsaya',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دورات لغات',
    levelEn: 'Language Courses',
    students: 400,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    isEnrolling: false,
    category: 'institute',
    featured: true
  },
  {
    id: '4',
    name: 'مركز التفوق - قدسيا',
    nameEn: 'Excellence Center - Qudsaya',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دروس خصوصية',
    levelEn: 'Private Tutoring',
    students: 250,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'course'
  },
  {
    id: '5',
    name: 'معهد التقنية الحديثة',
    nameEn: 'Modern Technology Institute',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دورات برمجة',
    levelEn: 'Programming Courses',
    students: 180,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'institute',
    new: true
  },
  {
    id: '6',
    name: 'مدرسة الفجر النموذجية',
    nameEn: 'Al-Fajr Model School',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'ابتدائي - إعدادي',
    levelEn: 'Primary - Preparatory',
    students: 650,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'school'
  },
  {
    id: '7',
    name: 'روضة الأمل',
    nameEn: 'Al-Amal Kindergarten',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'رياض أطفال',
    levelEn: 'Kindergarten',
    students: 100,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: false,
    category: 'kindergarten'
  },
  {
    id: '8',
    name: 'مركز إتقان للمهارات',
    nameEn: 'Etqan Skills Center',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دورات متنوعة',
    levelEn: 'Various Courses',
    students: 300,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'course'
  }
];

const qudsayaDahiaSchools: School[] = [
  {
    id: '1',
    name: 'مدرسة الضاحية النموذجية',
    nameEn: 'Dahia Model School',
    type: 'حكومية',
    typeEn: 'Public',
    level: 'ابتدائي - ثانوي',
    levelEn: 'Primary - Secondary',
    students: 850,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'school',
    featured: true
  },
  {
    id: '2',
    name: 'روضة الأمل - الضاحية',
    nameEn: 'Al-Amal Kindergarten - Dahia',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'رياض أطفال',
    levelEn: 'Kindergarten',
    students: 120,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'kindergarten',
    new: true
  },
  {
    id: '3',
    name: 'معهد اللغات - الضاحية',
    nameEn: 'Languages Institute - Dahia',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دورات لغات',
    levelEn: 'Language Courses',
    students: 350,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    isEnrolling: false,
    category: 'institute'
  },
  {
    id: '4',
    name: 'مركز التفوق - الضاحية',
    nameEn: 'Excellence Center - Dahia',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دروس خصوصية',
    levelEn: 'Private Tutoring',
    students: 200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'course',
    featured: true
  },
  {
    id: '5',
    name: 'معهد الحاسوب والتقنية',
    nameEn: 'Computer & Technology Institute',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'دورات حاسوب',
    levelEn: 'Computer Courses',
    students: 220,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'institute'
  },
  {
    id: '6',
    name: 'مدرسة النور الخاصة',
    nameEn: 'Al-Noor Private School',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'ابتدائي - ثانوي',
    levelEn: 'Primary - Secondary',
    students: 500,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'school',
    new: true
  },
  {
    id: '7',
    name: 'روضة البراعم',
    nameEn: 'Al-Baraem Kindergarten',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'رياض أطفال',
    levelEn: 'Kindergarten',
    students: 90,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    isEnrolling: true,
    category: 'kindergarten'
  },
  {
    id: '8',
    name: 'مركز المهارات المتقدمة',
    nameEn: 'Advanced Skills Center',
    type: 'خاصة',
    typeEn: 'Private',
    level: 'تدريب مهني',
    levelEn: 'Vocational Training',
    students: 280,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
    isEnrolling: false,
    category: 'course'
  }
];

const dataByRegion: Record<Region, School[]> = {
  'qudsaya-center': qudsayaCenterSchools,
  'qudsaya-dahia': qudsayaDahiaSchools
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: GraduationCap },
  { id: 'school', name: 'مدارس', nameEn: 'Schools', icon: School },
  { id: 'institute', name: 'معاهد', nameEn: 'Institutes', icon: Building2 },
  { id: 'course', name: 'دورات', nameEn: 'Courses', icon: BookOpenCheck },
  { id: 'kindergarten', name: 'رياض أطفال', nameEn: 'Kindergarten', icon: Baby },
];

export default function Education() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const schools = dataByRegion[region];

  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredSchools = schools.filter(school => {
    return activeCategory === 'all' || school.category === activeCategory;
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
  }, [filteredSchools]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Card width + gap
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
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'التعليم والمدارس' : 'Education & Schools'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredSchools.length} مؤسسة تعليمية في ${regionName}` : `${filteredSchools.length} institutions in ${regionName}`}
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
              ? schools.length
              : schools.filter(s => s.category === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredSchools.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-indigo-500 w-4' : 'bg-gray-300'
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
            {filteredSchools.map((school, index) => {
              const isFavorite = favorites.includes(school.id);

              return (
                <div
                  key={school.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={school.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(school.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`}
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        school.type === 'حكومية'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {isArabic ? school.type : school.typeEn}
                      </span>
                    </div>

                    {/* Enrolling Badge */}
                    {school.isEnrolling && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                          {isArabic ? 'تسجيل مفتوح' : 'Enrolling'}
                        </span>
                      </div>
                    )}

                    {/* Featured/New Badge */}
                    {(school.featured || school.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          school.featured ? 'bg-white/90 text-gray-900' : 'bg-violet-500 text-white'
                        }`}>
                          {school.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* School Info */}
                  <div className="px-1">
                    {/* Level & Rating */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        {isArabic ? school.level : school.levelEn}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold">{school.rating}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {isArabic ? school.name : school.nameEn}
                    </h3>

                    {/* Features */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3 text-indigo-500" />
                        <span>{school.students}+ {isArabic ? 'طالب' : 'students'}</span>
                      </span>
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
