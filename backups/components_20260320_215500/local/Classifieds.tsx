'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Megaphone, Heart, Clock, MapPin, ChevronLeft, ChevronRight, Car, Sofa, Smartphone, Home, Briefcase, Sparkles } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Classified {
  id: string;
  title: string;
  titleEn: string;
  price: string;
  category: 'cars' | 'furniture' | 'electronics' | 'appliances' | 'services' | 'other';
  categoryAr: string;
  categoryEn: string;
  images: string[];
  location: string;
  time: string;
  timeEn: string;
  featured?: boolean;
  urgent?: boolean;
  verified?: boolean;
}

const qudsayaCenterClassifieds: Classified[] = [
  {
    id: '1',
    title: 'سيارة تويوتا كامري 2020',
    titleEn: 'Toyota Camry 2020',
    price: '35,000',
    category: 'cars',
    categoryAr: 'سيارات',
    categoryEn: 'Cars',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الحي الغربي',
    time: 'منذ ساعتين',
    timeEn: '2 hours ago',
    featured: true,
    verified: true
  },
  {
    id: '2',
    title: 'أريكة جلدية فاخرة إيطالية',
    titleEn: 'Luxury Italian Leather Sofa',
    price: '1,200',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - المركز',
    time: 'منذ يوم',
    timeEn: '1 day ago',
    verified: true
  },
  {
    id: '3',
    title: 'آيفون 15 برو ماكس 512GB',
    titleEn: 'iPhone 15 Pro Max 512GB',
    price: '1,800',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ 3 ساعات',
    timeEn: '3 hours ago',
    urgent: true
  },
  {
    id: '4',
    title: 'غسالة سامسونج جديدة بالضمان',
    titleEn: 'Samsung Washing Machine New with Warranty',
    price: '650',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الشارع الرئيسي',
    time: 'منذ 5 ساعات',
    timeEn: '5 hours ago'
  },
  {
    id: '5',
    title: 'سيارة هيونداي توسان 2021',
    titleEn: 'Hyundai Tucson 2021',
    price: '28,000',
    category: 'cars',
    categoryAr: 'سيارات',
    categoryEn: 'Cars',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ 6 ساعات',
    timeEn: '6 hours ago',
    featured: true
  },
  {
    id: '6',
    title: 'طقم طعام خشب زان 12 شخص',
    titleEn: 'Oak Dining Set 12 Persons',
    price: '2,500',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا - الحي الشرقي',
    time: 'منذ يومين',
    timeEn: '2 days ago',
    verified: true
  },
  {
    id: '7',
    title: 'خدمات نقل أثاث وعفش',
    titleEn: 'Furniture Moving Services',
    price: 'حسب الطلب',
    category: 'services',
    categoryAr: 'خدمات',
    categoryEn: 'Services',
    images: [
      'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ أسبوع',
    timeEn: '1 week ago',
    featured: true
  },
  {
    id: '8',
    title: 'ماكينة قهوة إيطالية ديلونجي',
    titleEn: 'DeLonghi Italian Coffee Machine',
    price: '450',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'قدسيا',
    time: 'منذ 4 ساعات',
    timeEn: '4 hours ago'
  }
];

const qudsayaDahiaClassifieds: Classified[] = [
  {
    id: '1',
    title: 'سيارة هيونداي سوناتا 2019',
    titleEn: 'Hyundai Sonata 2019',
    price: '28,000',
    category: 'cars',
    categoryAr: 'سيارات',
    categoryEn: 'Cars',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ ساعة',
    timeEn: '1 hour ago',
    featured: true,
    verified: true
  },
  {
    id: '2',
    title: 'طقم كنب مودرن 9 قطع',
    titleEn: 'Modern Sofa Set 9 Pieces',
    price: '950',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - الحي الرئيسي',
    time: 'منذ يومين',
    timeEn: '2 days ago'
  },
  {
    id: '3',
    title: 'لابتوب ديل XPS 15 الجيل 12',
    titleEn: 'Dell XPS 15 Gen 12 Laptop',
    price: '1,200',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ 4 ساعات',
    timeEn: '4 hours ago',
    urgent: true
  },
  {
    id: '4',
    title: 'ثلاجة ال جي إنفرتر جديدة',
    titleEn: 'LG Inverter Fridge New',
    price: '700',
    category: 'appliances',
    categoryAr: 'أجهزة',
    categoryEn: 'Appliances',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - المركز التجاري',
    time: 'منذ 6 ساعات',
    timeEn: '6 hours ago'
  },
  {
    id: '5',
    title: 'سيارة كيا سبورتاج 2022',
    titleEn: 'Kia Sportage 2022',
    price: '32,000',
    category: 'cars',
    categoryAr: 'سيارات',
    categoryEn: 'Cars',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ 3 ساعات',
    timeEn: '3 hours ago',
    featured: true,
    verified: true
  },
  {
    id: '6',
    title: 'غرفة نوم كاملة مع دواليب',
    titleEn: 'Complete Bedroom with Wardrobes',
    price: '1,800',
    category: 'furniture',
    categoryAr: 'أثاث',
    categoryEn: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية - الحي الجنوبي',
    time: 'منذ 5 أيام',
    timeEn: '5 days ago'
  },
  {
    id: '7',
    title: 'خدمات تنظيف منازل',
    titleEn: 'Home Cleaning Services',
    price: '50/زيارة',
    category: 'services',
    categoryAr: 'خدمات',
    categoryEn: 'Services',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ 3 أيام',
    timeEn: '3 days ago',
    verified: true
  },
  {
    id: '8',
    title: 'تلفزيون سوني 65 بوصة 4K',
    titleEn: 'Sony 65 inch 4K TV',
    price: '850',
    category: 'electronics',
    categoryAr: 'إلكترونيات',
    categoryEn: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80',
    ],
    location: 'الضاحية',
    time: 'منذ يوم',
    timeEn: '1 day ago',
    featured: true
  }
];

const dataByRegion: Record<Region, Classified[]> = {
  'qudsaya-center': qudsayaCenterClassifieds,
  'qudsaya-dahia': qudsayaDahiaClassifieds
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Megaphone },
  { id: 'cars', name: 'سيارات', nameEn: 'Cars', icon: Car },
  { id: 'furniture', name: 'أثاث', nameEn: 'Furniture', icon: Sofa },
  { id: 'electronics', name: 'إلكترونيات', nameEn: 'Electronics', icon: Smartphone },
  { id: 'appliances', name: 'أجهزة', nameEn: 'Appliances', icon: Home },
  { id: 'services', name: 'خدمات', nameEn: 'Services', icon: Briefcase },
];

export default function Classifieds() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const classifieds = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredClassifieds = classifieds.filter(item => {
    return activeCategory === 'all' || item.category === activeCategory;
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
  }, [filteredClassifieds]);

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

  const nextImage = (itemId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (itemId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <section className="py-4 bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-200">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الإعلانات المبوبة' : 'Classifieds'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredClassifieds.length} إعلان في ${regionName}` : `${filteredClassifieds.length} ads in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters - Scrollable Style */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? classifieds.length 
              : classifieds.filter(c => c.category === filter.id).length;
            
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

        {/* Swipe Hint with Dots Indicator */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredClassifieds.map((_, idx) => (
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
            {filteredClassifieds.map((item, index) => {
              const isFavorite = favorites.includes(item.id);
              const imageIndex = currentImageIndex[item.id] || 0;
              
              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img 
                      src={item.images[imageIndex]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Image Navigation */}
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(item.id, item.images.length); }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(item.id, item.images.length); }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {item.images.map((_, idx) => (
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
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                        {isArabic ? item.categoryAr : item.categoryEn}
                      </span>
                    </div>

                    {/* Featured/Urgent/Verified Badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {item.verified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </span>
                      )}
                      {item.featured && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {item.urgent && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full animate-pulse">
                          {isArabic ? 'عاجل' : 'Urgent'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="px-1">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {isArabic ? item.title : item.titleEn}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-black text-violet-600">${item.price}</span>
                    </div>

                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isArabic ? item.time : item.timeEn}</span>
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
