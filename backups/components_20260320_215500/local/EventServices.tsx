'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Cake, Flower2, UtensilsCrossed, PartyPopper, Camera, Gift,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Truck, Calendar
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface EventService {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'sweets' | 'flowers' | 'bakery' | 'rental' | 'studio' | 'gifts';
  image: string;
  location: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  services: string[];
  servicesEn: string[];
  delivery?: boolean;
  rating: number;
  reviews: number;
  price?: string;
  featured?: boolean;
  new?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterEvents: EventService[] = [
  // حلويات
  {
    id: 'sw1',
    name: 'محل حلويات السلطان',
    nameEn: 'Sultan Sweets',
    type: 'حلويات',
    typeEn: 'Sweets',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 22:00',
    phone: '0999111101',
    whatsapp: '0999111101',
    services: ['كيك', 'حلويات شرقية', 'شوكولاتة'],
    servicesEn: ['Cake', 'Eastern Sweets', 'Chocolate'],
    delivery: true,
    rating: 4.9,
    reviews: 285,
    price: '2000 - 50000',
    featured: true
  },
  {
    id: 'sw2',
    name: 'حلويات الأمانة',
    nameEn: 'Al-Amana Sweets',
    type: 'حلويات',
    typeEn: 'Sweets',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 21:00',
    phone: '0999111102',
    services: ['حلويات', 'بقلاوة', 'كنافة'],
    servicesEn: ['Sweets', 'Baklava', 'Kunafa'],
    delivery: true,
    rating: 4.7,
    reviews: 195,
    new: true
  },
  {
    id: 'sw3',
    name: 'محل الشوكولاتة',
    nameEn: 'Chocolate Shop',
    type: 'شوكولاتة',
    typeEn: 'Chocolate',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '10:00 - 22:00',
    phone: '0999111103',
    services: ['شوكولاتة', 'هدايا', 'بوكسات'],
    servicesEn: ['Chocolate', 'Gifts', 'Boxes'],
    delivery: true,
    rating: 4.8,
    reviews: 165,
    featured: true
  },
  // زهور
  {
    id: 'fl1',
    name: 'محل الزهور الجميلة',
    nameEn: 'Beautiful Flowers',
    type: 'زهور',
    typeEn: 'Flowers',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 21:00',
    phone: '0999222201',
    services: ['باقات', 'تنسيق زهور', 'ورود'],
    servicesEn: ['Bouquets', 'Flower Arrangement', 'Roses'],
    delivery: true,
    rating: 4.8,
    reviews: 175,
    featured: true
  },
  {
    id: 'fl2',
    name: 'زهرة الربيع',
    nameEn: 'Spring Flower',
    type: 'زهور',
    typeEn: 'Flowers',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 20:00',
    phone: '0999222202',
    services: ['زهور', 'نباتات', 'هدايا'],
    servicesEn: ['Flowers', 'Plants', 'Gifts'],
    delivery: true,
    rating: 4.6,
    reviews: 125
  },
  // أفران
  {
    id: 'bk1',
    name: 'مخبز النور',
    nameEn: 'Al-Noor Bakery',
    type: 'مخبز',
    typeEn: 'Bakery',
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '6:00 - 21:00',
    phone: '0999333301',
    services: ['خبز', 'معجنات', 'فطائر'],
    servicesEn: ['Bread', 'Pastries', 'Pies'],
    delivery: true,
    rating: 4.7,
    reviews: 220,
    featured: true
  },
  {
    id: 'bk2',
    name: 'مخبز الضيافة',
    nameEn: 'Hospitality Bakery',
    type: 'مخبز',
    typeEn: 'Bakery',
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '5:00 - 20:00',
    phone: '0999333302',
    services: ['خبز عربي', 'مناقيش', 'صاج'],
    servicesEn: ['Arabic Bread', 'Manakish', 'Saj'],
    rating: 4.5,
    reviews: 145
  },
  // تأجير
  {
    id: 'rn1',
    name: 'تأجير مستلزمات الأفراح',
    nameEn: 'Wedding Supplies Rental',
    type: 'تأجير',
    typeEn: 'Rental',
    category: 'rental',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '9:00 - 18:00',
    phone: '0999444401',
    services: ['كراسي', 'طاولات', 'خيام'],
    servicesEn: ['Chairs', 'Tables', 'Tents'],
    rating: 4.6,
    reviews: 95,
    featured: true
  },
  {
    id: 'rn2',
    name: 'صالة الأفراح',
    nameEn: 'Wedding Hall',
    type: 'قاعة أفراح',
    typeEn: 'Wedding Hall',
    category: 'rental',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: 'حسب الحجز',
    phone: '0999444402',
    services: ['قاعة', 'تنظيم', 'كامل'],
    servicesEn: ['Hall', 'Organization', 'Full'],
    rating: 4.8,
    reviews: 125,
    new: true
  },
  // تصوير
  {
    id: 'st1',
    name: 'استوديو التصوير',
    nameEn: 'Photography Studio',
    type: 'استوديو',
    typeEn: 'Studio',
    category: 'studio',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '10:00 - 20:00',
    phone: '0999555501',
    whatsapp: '0999555501',
    services: ['تصوير', 'مونتاج', 'طباعة'],
    servicesEn: ['Photography', 'Editing', 'Printing'],
    rating: 4.9,
    reviews: 185,
    featured: true
  },
  {
    id: 'st2',
    name: 'تصوير الأعراس',
    nameEn: 'Wedding Photography',
    type: 'تصوير',
    typeEn: 'Photography',
    category: 'studio',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: 'حسب الحجز',
    phone: '0999555502',
    services: ['أعراس', 'مناسبات', 'تصوير جوي'],
    servicesEn: ['Weddings', 'Events', 'Aerial'],
    rating: 4.7,
    reviews: 145
  },
  // هدايا
  {
    id: 'gf1',
    name: 'محل الهدايا',
    nameEn: 'Gifts Shop',
    type: 'هدايا',
    typeEn: 'Gifts',
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '9:00 - 21:00',
    phone: '0999666601',
    services: ['هدايا', 'تغليف', 'بطاقات'],
    servicesEn: ['Gifts', 'Wrapping', 'Cards'],
    delivery: true,
    rating: 4.6,
    reviews: 115,
    featured: true
  },
  {
    id: 'gf2',
    name: 'هدايا المناسبات',
    nameEn: 'Occasions Gifts',
    type: 'هدايا',
    typeEn: 'Gifts',
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '10:00 - 20:00',
    phone: '0999666602',
    services: ['هدايا', 'إكسسوارات', 'تذكارات'],
    servicesEn: ['Gifts', 'Accessories', 'Souvenirs'],
    rating: 4.5,
    reviews: 85,
    new: true
  }
];

// بيانات الضاحية
const qudsayaDahiaEvents: EventService[] = [
  // حلويات
  {
    id: 'dsw1',
    name: 'حلويات الضاحية',
    nameEn: 'Dahia Sweets',
    type: 'حلويات',
    typeEn: 'Sweets',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 22:00',
    phone: '0999111104',
    services: ['كيك', 'حلويات', 'معجنات'],
    servicesEn: ['Cake', 'Sweets', 'Pastries'],
    delivery: true,
    rating: 4.8,
    reviews: 225,
    featured: true
  },
  {
    id: 'dsw2',
    name: 'حلويات النور',
    nameEn: 'Al-Noor Sweets',
    type: 'حلويات',
    typeEn: 'Sweets',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '9:00 - 21:00',
    phone: '0999111105',
    services: ['حلويات شرقية', 'كنافة'],
    servicesEn: ['Eastern Sweets', 'Kunafa'],
    delivery: true,
    rating: 4.6,
    reviews: 165
  },
  // زهور
  {
    id: 'dfl1',
    name: 'زهور الضاحية',
    nameEn: 'Dahia Flowers',
    type: 'زهور',
    typeEn: 'Flowers',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 21:00',
    phone: '0999222203',
    services: ['باقات', 'ورود', 'هدايا'],
    servicesEn: ['Bouquets', 'Roses', 'Gifts'],
    delivery: true,
    rating: 4.7,
    reviews: 155,
    new: true
  },
  // أفران
  {
    id: 'dbk1',
    name: 'مخبز الضاحية',
    nameEn: 'Dahia Bakery',
    type: 'مخبز',
    typeEn: 'Bakery',
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '6:00 - 21:00',
    phone: '0999333303',
    services: ['خبز', 'معجنات'],
    servicesEn: ['Bread', 'Pastries'],
    rating: 4.6,
    reviews: 185
  },
  // تأجير
  {
    id: 'drn1',
    name: 'تأجير - الضاحية',
    nameEn: 'Rental - Dahia',
    type: 'تأجير',
    typeEn: 'Rental',
    category: 'rental',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '9:00 - 18:00',
    phone: '0999444403',
    services: ['كراسي', 'طاولات'],
    servicesEn: ['Chairs', 'Tables'],
    rating: 4.5,
    reviews: 75
  },
  // تصوير
  {
    id: 'dst1',
    name: 'استوديو الضاحية',
    nameEn: 'Dahia Studio',
    type: 'استوديو',
    typeEn: 'Studio',
    category: 'studio',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '10:00 - 20:00',
    phone: '0999555503',
    services: ['تصوير', 'طباعة'],
    servicesEn: ['Photography', 'Printing'],
    rating: 4.7,
    reviews: 125,
    featured: true
  },
  // هدايا
  {
    id: 'dgf1',
    name: 'هدايا الضاحية',
    nameEn: 'Dahia Gifts',
    type: 'هدايا',
    typeEn: 'Gifts',
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '9:00 - 21:00',
    phone: '0999666603',
    services: ['هدايا', 'تغليف'],
    servicesEn: ['Gifts', 'Wrapping'],
    rating: 4.5,
    reviews: 95
  }
];

const dataByRegion: Record<Region, EventService[]> = {
  'qudsaya-center': qudsayaCenterEvents,
  'qudsaya-dahia': qudsayaDahiaEvents
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: PartyPopper },
  { id: 'sweets', name: 'حلويات', nameEn: 'Sweets', icon: Cake },
  { id: 'flowers', name: 'زهور', nameEn: 'Flowers', icon: Flower2 },
  { id: 'bakery', name: 'أفران', nameEn: 'Bakery', icon: UtensilsCrossed },
  { id: 'rental', name: 'تأجير', nameEn: 'Rental', icon: Gift },
  { id: 'studio', name: 'تصوير', nameEn: 'Studio', icon: Camera },
  { id: 'gifts', name: 'هدايا', nameEn: 'Gifts', icon: Gift },
];

export default function EventServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const events = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = events.filter(e => {
    return activeCategory === 'all' || e.category === activeCategory;
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
  }, [filteredEvents]);

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
    <section className="py-4 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'خدمات المناسبات' : 'Event Services'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredEvents.length} خدمة في ${regionName}` : `${filteredEvents.length} services in ${regionName}`}
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
              ? events.length 
              : events.filter(e => e.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-rose-200' : 'text-gray-400'}`}>{count}</span>
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
                  idx === 0 ? 'bg-rose-500 w-4' : 'bg-gray-300'
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
            {filteredEvents.map((service, index) => {
              const isFavorite = favorites.includes(service.id);
              
              return (
                <div
                  key={service.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                    <img 
                      src={service.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {service.delivery && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                          <Truck className="w-2.5 h-2.5" />
                          {isArabic ? 'توصيل' : 'Delivery'}
                        </span>
                      )}
                      {service.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-gray-900">
                          {isArabic ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {service.new && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          {isArabic ? 'جديد' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="px-1">
                    {/* Rating & Price */}
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-900">{service.rating}</span>
                        <span className="text-[10px] text-gray-400">({service.reviews})</span>
                      </div>
                      {service.price && (
                        <span className="text-[10px] text-gray-500">{service.price} ل.س</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? service.name : service.nameEn}
                    </h3>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(isArabic ? service.services : service.servicesEn).slice(0, 3).map((srv, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                          {srv}
                        </span>
                      ))}
                    </div>

                    {/* Location & Hours */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{service.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.hours}</span>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${service.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
