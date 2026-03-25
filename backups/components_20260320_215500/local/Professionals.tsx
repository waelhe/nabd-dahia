'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, HardHat, Calculator, Briefcase, Palette, Camera,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Award, Building
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Professional {
  id: string;
  name: string;
  nameEn: string;
  profession: string;
  professionEn: string;
  category: 'lawyer' | 'engineer' | 'accountant' | 'consultant' | 'designer' | 'photographer';
  specialty: string;
  specialtyEn: string;
  image: string;
  location: string;
  phone: string;
  whatsapp?: string;
  experience: string;
  rating: number;
  reviews: number;
  verified?: boolean;
  featured?: boolean;
  available?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterProfessionals: Professional[] = [
  // محامين
  {
    id: 'l1',
    name: 'المحامي أحمد الخالد',
    nameEn: 'Lawyer Ahmed Al-Khaled',
    profession: 'محامي',
    professionEn: 'Lawyer',
    category: 'lawyer',
    specialty: 'قانون مدني',
    specialtyEn: 'Civil Law',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - برج القاضي',
    phone: '0999111001',
    whatsapp: '0999111001',
    experience: '15 سنة',
    rating: 4.9,
    reviews: 85,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'l2',
    name: 'المحامية سارة المنصور',
    nameEn: 'Lawyer Sara Al-Mansour',
    profession: 'محامية',
    professionEn: 'Lawyer',
    category: 'lawyer',
    specialty: 'قانون عقاري',
    specialtyEn: 'Real Estate Law',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    phone: '0999111002',
    experience: '12 سنة',
    rating: 4.8,
    reviews: 72,
    verified: true,
    available: true
  },
  {
    id: 'l3',
    name: 'المحامي محمود العلي',
    nameEn: 'Lawyer Mahmoud Al-Ali',
    profession: 'محامي',
    professionEn: 'Lawyer',
    category: 'lawyer',
    specialty: 'قانون تجاري',
    specialtyEn: 'Commercial Law',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    phone: '0999111003',
    experience: '10 سنوات',
    rating: 4.7,
    reviews: 65,
    available: true
  },
  // مهندسين
  {
    id: 'e1',
    name: 'المهندس فادي السيد',
    nameEn: 'Eng. Fadi Al-Sayed',
    profession: 'مهندس مدني',
    professionEn: 'Civil Engineer',
    category: 'engineer',
    specialty: 'إنشاءات',
    specialtyEn: 'Construction',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - مكتب المهندسين',
    phone: '0999222001',
    whatsapp: '0999222001',
    experience: '18 سنة',
    rating: 4.9,
    reviews: 110,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'e2',
    name: 'المهندس خالد العمري',
    nameEn: 'Eng. Khaled Al-Omari',
    profession: 'مهندس معماري',
    professionEn: 'Architect',
    category: 'engineer',
    specialty: 'تصميم معماري',
    specialtyEn: 'Architectural Design',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    phone: '0999222002',
    experience: '14 سنة',
    rating: 4.8,
    reviews: 92,
    verified: true,
    available: true
  },
  {
    id: 'e3',
    name: 'المهندس ياسر الحسن',
    nameEn: 'Eng. Yasser Al-Hassan',
    profession: 'مهندس كهرباء',
    professionEn: 'Electrical Engineer',
    category: 'engineer',
    specialty: 'كهرباء مباني',
    specialtyEn: 'Building Electrical',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    phone: '0999222003',
    experience: '11 سنة',
    rating: 4.6,
    reviews: 58,
    available: false
  },
  // محاسبين
  {
    id: 'a1',
    name: 'المحاسب نزار الخطيب',
    nameEn: 'Accountant Nizar Al-Khatib',
    profession: 'محاسب قانوني',
    professionEn: 'CPA',
    category: 'accountant',
    specialty: 'محاسبة وضرائب',
    specialtyEn: 'Accounting & Tax',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - برج الأعمال',
    phone: '0999333001',
    experience: '20 سنة',
    rating: 4.9,
    reviews: 95,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'a2',
    name: 'المحاسب رامي عيسى',
    nameEn: 'Accountant Rami Issa',
    profession: 'محاسب',
    professionEn: 'Accountant',
    category: 'accountant',
    specialty: 'تدقيق حسابات',
    specialtyEn: 'Auditing',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    phone: '0999333002',
    experience: '8 سنوات',
    rating: 4.7,
    reviews: 62,
    available: true
  },
  // استشاريين
  {
    id: 'c1',
    name: 'الاستشاري سمير ناصر',
    nameEn: 'Consultant Samir Nasser',
    profession: 'مستشار إداري',
    professionEn: 'Management Consultant',
    category: 'consultant',
    specialty: 'إدارة أعمال',
    specialtyEn: 'Business Management',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - برج الأعمال',
    phone: '0999444001',
    experience: '16 سنة',
    rating: 4.8,
    reviews: 78,
    verified: true,
    available: true
  },
  {
    id: 'c2',
    name: 'الاستشارية لمى حسين',
    nameEn: 'Consultant Luma Hussein',
    profession: 'مستشارة تسويق',
    professionEn: 'Marketing Consultant',
    category: 'consultant',
    specialty: 'تسويق رقمي',
    specialtyEn: 'Digital Marketing',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    phone: '0999444002',
    experience: '9 سنوات',
    rating: 4.7,
    reviews: 55,
    available: true
  },
  // مصممين
  {
    id: 'd1',
    name: 'المصمم هاني زين',
    nameEn: 'Designer Hani Zein',
    profession: 'مصمم جرافيك',
    professionEn: 'Graphic Designer',
    category: 'designer',
    specialty: 'هوية بصرية',
    specialtyEn: 'Visual Identity',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - مكتب التصميم',
    phone: '0999555001',
    whatsapp: '0999555001',
    experience: '7 سنوات',
    rating: 4.6,
    reviews: 48,
    featured: true,
    available: true
  },
  {
    id: 'd2',
    name: 'المصممة رنا سليمان',
    nameEn: 'Designer Rana Suleiman',
    profession: 'مصممة ديكور',
    professionEn: 'Interior Designer',
    category: 'designer',
    specialty: 'تصميم داخلي',
    specialtyEn: 'Interior Design',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    phone: '0999555002',
    experience: '10 سنوات',
    rating: 4.8,
    reviews: 65,
    verified: true,
    available: true
  },
  // مصورين
  {
    id: 'p1',
    name: 'المصور سامر العلي',
    nameEn: 'Photographer Samer Al-Ali',
    profession: 'مصور أعراس',
    professionEn: 'Wedding Photographer',
    category: 'photographer',
    specialty: 'تصوير أعراس',
    specialtyEn: 'Wedding Photography',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - استوديو سامر',
    phone: '0999666001',
    whatsapp: '0999666001',
    experience: '8 سنوات',
    rating: 4.9,
    reviews: 120,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'p2',
    name: 'المصور يوسف أحمد',
    nameEn: 'Photographer Youssef Ahmed',
    profession: 'مصور مناسبات',
    professionEn: 'Event Photographer',
    category: 'photographer',
    specialty: 'تصوير مناسبات',
    specialtyEn: 'Event Photography',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    phone: '0999666002',
    experience: '5 سنوات',
    rating: 4.7,
    reviews: 72,
    available: true
  }
];

// بيانات الضاحية
const qudsayaDahiaProfessionals: Professional[] = [
  // محامين
  {
    id: 'dl1',
    name: 'المحامي حسن الزهراوي',
    nameEn: 'Lawyer Hassan Al-Zahrawi',
    profession: 'محامي',
    professionEn: 'Lawyer',
    category: 'lawyer',
    specialty: 'قانون جنائي',
    specialtyEn: 'Criminal Law',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - مكتب المحامي',
    phone: '0999111004',
    experience: '13 سنة',
    rating: 4.8,
    reviews: 78,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'dl2',
    name: 'المحامية نورة السالم',
    nameEn: 'Lawyer Noura Al-Salem',
    profession: 'محامية',
    professionEn: 'Lawyer',
    category: 'lawyer',
    specialty: 'قانون أسرة',
    specialtyEn: 'Family Law',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    phone: '0999111005',
    experience: '9 سنوات',
    rating: 4.7,
    reviews: 55,
    available: true
  },
  // مهندسين
  {
    id: 'de1',
    name: 'المهندس بلال حسن',
    nameEn: 'Eng. Bilal Hassan',
    profession: 'مهندس مدني',
    professionEn: 'Civil Engineer',
    category: 'engineer',
    specialty: 'ترميم وبناء',
    specialtyEn: 'Renovation & Building',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - مكتب الهندسة',
    phone: '0999222004',
    experience: '16 سنة',
    rating: 4.8,
    reviews: 88,
    verified: true,
    featured: true,
    available: true
  },
  {
    id: 'de2',
    name: 'المهندس عامر فارس',
    nameEn: 'Eng. Amer Fares',
    profession: 'مهندس ميكانيك',
    professionEn: 'Mechanical Engineer',
    category: 'engineer',
    specialty: 'ميكانيك تطبيقي',
    specialtyEn: 'Applied Mechanics',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المنطقة الصناعية',
    phone: '0999222005',
    experience: '12 سنة',
    rating: 4.6,
    reviews: 52,
    available: true
  },
  // محاسبين
  {
    id: 'da1',
    name: 'المحاسب وليد سعيد',
    nameEn: 'Accountant Waleed Saeed',
    profession: 'محاسب قانوني',
    professionEn: 'CPA',
    category: 'accountant',
    specialty: 'محاسبة شركات',
    specialtyEn: 'Corporate Accounting',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - برج الأعمال',
    phone: '0999333003',
    experience: '15 سنة',
    rating: 4.8,
    reviews: 82,
    verified: true,
    available: true
  },
  // استشاريين
  {
    id: 'dc1',
    name: 'الاستشاري مازن خالد',
    nameEn: 'Consultant Mazen Khaled',
    profession: 'مستشار موارد بشرية',
    professionEn: 'HR Consultant',
    category: 'consultant',
    specialty: 'موارد بشرية',
    specialtyEn: 'Human Resources',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المركز التجاري',
    phone: '0999444003',
    experience: '12 سنة',
    rating: 4.7,
    reviews: 48,
    available: true
  },
  // مصممين
  {
    id: 'dd1',
    name: 'المصممة هدى منصور',
    nameEn: 'Designer Huda Mansour',
    profession: 'مصممة أزياء',
    professionEn: 'Fashion Designer',
    category: 'designer',
    specialty: 'أزياء نسائية',
    specialtyEn: 'Women\'s Fashion',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - مشغل الأزياء',
    phone: '0999555003',
    experience: '6 سنوات',
    rating: 4.5,
    reviews: 38,
    available: true
  },
  // مصورين
  {
    id: 'dp1',
    name: 'المصور كريم نوح',
    nameEn: 'Photographer Karim Nuh',
    profession: 'مصور أطفال',
    professionEn: 'Kids Photographer',
    category: 'photographer',
    specialty: 'تصوير أطفال',
    specialtyEn: 'Kids Photography',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - استوديو كريم',
    phone: '0999666003',
    whatsapp: '0999666003',
    experience: '4 سنوات',
    rating: 4.6,
    reviews: 55,
    featured: true,
    available: true
  }
];

const dataByRegion: Record<Region, Professional[]> = {
  'qudsaya-center': qudsayaCenterProfessionals,
  'qudsaya-dahia': qudsayaDahiaProfessionals
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Briefcase },
  { id: 'lawyer', name: 'محامين', nameEn: 'Lawyers', icon: Scale },
  { id: 'engineer', name: 'مهندسين', nameEn: 'Engineers', icon: HardHat },
  { id: 'accountant', name: 'محاسبين', nameEn: 'Accountants', icon: Calculator },
  { id: 'consultant', name: 'استشاريين', nameEn: 'Consultants', icon: Briefcase },
  { id: 'designer', name: 'مصممين', nameEn: 'Designers', icon: Palette },
  { id: 'photographer', name: 'مصورين', nameEn: 'Photographers', icon: Camera },
];

export default function Professionals() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const professionals = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProfessionals = professionals.filter(pro => {
    return activeCategory === 'all' || pro.category === activeCategory;
  });

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
  }, [filteredProfessionals]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
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
    <section className="py-4 bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المهن الحرة' : 'Professionals'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredProfessionals.length} مهني في ${regionName}` : `${filteredProfessionals.length} professionals in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? professionals.length 
              : professionals.filter(p => p.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-violet-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredProfessionals.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-violet-500 w-4' : 'bg-gray-300'
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

          {/* Cards Container */}
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
            {filteredProfessionals.map((pro, index) => {
              const isFavorite = favorites.includes(pro.id);
              
              return (
                <div
                  key={pro.id}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img 
                      src={pro.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(pro.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Available Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        pro.available !== false ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {pro.available !== false ? (isArabic ? 'متاح' : 'Available') : (isArabic ? 'مشغول' : 'Busy')}
                      </span>
                    </div>

                    {/* Verified/Featured Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {pro.verified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </span>
                      )}
                      {pro.featured && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="px-1">
                    {/* Specialty Badge */}
                    <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                      {isArabic ? pro.specialty : pro.specialtyEn}
                    </span>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-gray-900 mt-1 mb-0.5 line-clamp-1">
                      {isArabic ? pro.name : pro.nameEn}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-900">{pro.rating}</span>
                      <span className="text-[10px] text-gray-400">({pro.reviews})</span>
                    </div>

                    {/* Location & Experience */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{pro.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{pro.experience}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${pro.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
      </div>
    </section>
  );
}
