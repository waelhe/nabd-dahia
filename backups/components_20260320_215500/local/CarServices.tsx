'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, Droplets, Wrench, Battery, CircleDot, Paintbrush, Settings, ClipboardCheck,
  Star, MapPin, Clock, Phone, Heart, ChevronLeft, ChevronRight, Shield, Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface CarService {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'carwash' | 'mechanic' | 'electric' | 'tires' | 'paint' | 'parts' | 'inspection';
  image: string;
  location: string;
  hours: string;
  phone: string;
  whatsapp?: string;
  services: string[];
  servicesEn: string[];
  rating: number;
  reviews: number;
  price?: string;
  featured?: boolean;
  new?: boolean;
  available?: boolean;
}

// بيانات قدسيا المركز
const qudsayaCenterServices: CarService[] = [
  // مغاسل سيارات
  {
    id: 'cw1',
    name: 'مغسلة السيارات الفاخرة',
    nameEn: 'Luxury Car Wash',
    type: 'مغسلة سيارات',
    typeEn: 'Car Wash',
    category: 'carwash',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل الرئيسي',
    hours: '7:00 - 21:00',
    phone: '0999111101',
    whatsapp: '0999111101',
    services: ['غسيل خارجي', 'تلميع', 'تنظيف داخلي'],
    servicesEn: ['Exterior Wash', 'Polishing', 'Interior Cleaning'],
    rating: 4.9,
    reviews: 180,
    price: '500 - 2000',
    featured: true,
    available: true
  },
  {
    id: 'cw2',
    name: 'مغسلة السرعة',
    nameEn: 'Speed Car Wash',
    type: 'مغسلة سيارات',
    typeEn: 'Car Wash',
    category: 'carwash',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '8:00 - 20:00',
    phone: '0999111102',
    services: ['غسيل سريع', 'غسيل بالبخار'],
    servicesEn: ['Quick Wash', 'Steam Wash'],
    rating: 4.6,
    reviews: 95,
    price: '300 - 800',
    available: true
  },
  // ورش ميكانيك
  {
    id: 'mc1',
    name: 'ورشة الميكانيك الشامل',
    nameEn: 'General Mechanic Workshop',
    type: 'ميكانيك',
    typeEn: 'Mechanic',
    category: 'mechanic',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المنطقة الصناعية',
    hours: '8:00 - 18:00',
    phone: '0999222201',
    services: ['صيانة عامة', 'محركات', 'فرامل'],
    servicesEn: ['General Maintenance', 'Engines', 'Brakes'],
    rating: 4.8,
    reviews: 150,
    featured: true,
    available: true
  },
  {
    id: 'mc2',
    name: 'مركز صيانة السيارات',
    nameEn: 'Car Maintenance Center',
    type: 'ميكانيك',
    typeEn: 'Mechanic',
    category: 'mechanic',
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الشرقي',
    hours: '8:00 - 17:00',
    phone: '0999222202',
    services: ['تغيير زيت', 'فلاتر', 'صيانة دورية'],
    servicesEn: ['Oil Change', 'Filters', 'Periodic Maintenance'],
    rating: 4.5,
    reviews: 88,
    new: true,
    available: true
  },
  // كهرباء سيارات
  {
    id: 'el1',
    name: 'كهرباء السيارات الحديثة',
    nameEn: 'Modern Car Electric',
    type: 'كهرباء سيارات',
    typeEn: 'Car Electric',
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '8:00 - 19:00',
    phone: '0999333301',
    services: ['بطاريات', 'دينامو', 'تمامير'],
    servicesEn: ['Batteries', 'Alternators', 'Starters'],
    rating: 4.7,
    reviews: 110,
    featured: true,
    available: true
  },
  {
    id: 'el2',
    name: 'مركز البطاريات',
    nameEn: 'Battery Center',
    type: 'كهرباء سيارات',
    typeEn: 'Car Electric',
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999333302',
    services: ['بيع بطاريات', 'شحن', 'تركيب'],
    servicesEn: ['Battery Sales', 'Charging', 'Installation'],
    rating: 4.6,
    reviews: 75,
    available: true
  },
  // إطارات
  {
    id: 'tr1',
    name: 'مركز الإطارات الشامل',
    nameEn: 'Comprehensive Tire Center',
    type: 'إطارات وجنوط',
    typeEn: 'Tires & Rims',
    category: 'tires',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المدخل',
    hours: '8:00 - 19:00',
    phone: '0999444401',
    services: ['بيع إطارات', 'تركيب', 'توازن'],
    servicesEn: ['Tire Sales', 'Installation', 'Balancing'],
    rating: 4.8,
    reviews: 125,
    featured: true,
    available: true
  },
  {
    id: 'tr2',
    name: 'جنوط وإطارات النور',
    nameEn: 'Al-Noor Tires & Rims',
    type: 'إطارات وجنوط',
    typeEn: 'Tires & Rims',
    category: 'tires',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - شارع الرئيسي',
    hours: '9:00 - 18:00',
    phone: '0999444402',
    services: ['جنوط', 'إطارات', 'صيانة'],
    servicesEn: ['Rims', 'Tires', 'Maintenance'],
    rating: 4.5,
    reviews: 68,
    available: true
  },
  // دهان
  {
    id: 'pt1',
    name: 'دهان السيارات المتميز',
    nameEn: 'Premium Car Painting',
    type: 'دهان سيارات',
    typeEn: 'Car Painting',
    category: 'paint',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المنطقة الصناعية',
    hours: '8:00 - 17:00',
    phone: '0999555501',
    services: ['دهان كامل', 'لمعان', 'إصلاح خدوش'],
    servicesEn: ['Full Paint', 'Polishing', 'Scratch Repair'],
    rating: 4.7,
    reviews: 92,
    featured: true,
    available: true
  },
  {
    id: 'pt2',
    name: 'مركز الصقل والدهان',
    nameEn: 'Polishing & Painting Center',
    type: 'دهان سيارات',
    typeEn: 'Car Painting',
    category: 'paint',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الحي الغربي',
    hours: '8:00 - 16:00',
    phone: '0999555502',
    services: ['صقل', 'دهان جزئي', 'نانو'],
    servicesEn: ['Polishing', 'Partial Paint', 'Nano'],
    rating: 4.6,
    reviews: 55,
    new: true,
    available: true
  },
  // قطع غيار
  {
    id: 'pr1',
    name: 'قطع غيار السيارات',
    nameEn: 'Car Spare Parts',
    type: 'قطع غيار',
    typeEn: 'Spare Parts',
    category: 'parts',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - الساحة',
    hours: '8:00 - 19:00',
    phone: '0999666601',
    services: ['قطع أصلية', 'قطع تجارية', 'استيراد'],
    servicesEn: ['Original Parts', 'Commercial Parts', 'Import'],
    rating: 4.6,
    reviews: 105,
    featured: true,
    available: true
  },
  // فحص سيارات
  {
    id: 'in1',
    name: 'مركز فحص السيارات',
    nameEn: 'Car Inspection Center',
    type: 'فحص سيارات',
    typeEn: 'Car Inspection',
    category: 'inspection',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
    location: 'قدسيا - المنطقة الصناعية',
    hours: '8:00 - 15:00',
    phone: '0999777701',
    services: ['فحص شامل', 'فحص قبل الشراء', 'فحص سنوي'],
    servicesEn: ['Full Inspection', 'Pre-purchase', 'Annual Inspection'],
    rating: 4.8,
    reviews: 78,
    available: true
  }
];

// بيانات الضاحية
const qudsayaDahiaServices: CarService[] = [
  // مغاسل سيارات
  {
    id: 'dcw1',
    name: 'مغسلة الضاحية',
    nameEn: 'Dahia Car Wash',
    type: 'مغسلة سيارات',
    typeEn: 'Car Wash',
    category: 'carwash',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '7:00 - 21:00',
    phone: '0999111103',
    services: ['غسيل خارجي', 'تلميع', 'شمع'],
    servicesEn: ['Exterior Wash', 'Polishing', 'Wax'],
    rating: 4.8,
    reviews: 165,
    featured: true,
    available: true
  },
  {
    id: 'dcw2',
    name: 'مغسلة البخار',
    nameEn: 'Steam Car Wash',
    type: 'مغسلة سيارات',
    typeEn: 'Car Wash',
    category: 'carwash',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 20:00',
    phone: '0999111104',
    services: ['غسيل بالبخار', 'تنظيف محرك'],
    servicesEn: ['Steam Wash', 'Engine Cleaning'],
    rating: 4.7,
    reviews: 120,
    new: true,
    available: true
  },
  // ورش ميكانيك
  {
    id: 'dmc1',
    name: 'ورشة ميكانيك الضاحية',
    nameEn: 'Dahia Mechanic Workshop',
    type: 'ميكانيك',
    typeEn: 'Mechanic',
    category: 'mechanic',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المنطقة الصناعية',
    hours: '8:00 - 18:00',
    phone: '0999222203',
    services: ['صيانة', 'محركات', 'قير'],
    servicesEn: ['Maintenance', 'Engines', 'Transmission'],
    rating: 4.7,
    reviews: 138,
    featured: true,
    available: true
  },
  // كهرباء سيارات
  {
    id: 'del1',
    name: 'كهرباء سيارات الضاحية',
    nameEn: 'Dahia Car Electric',
    type: 'كهرباء سيارات',
    typeEn: 'Car Electric',
    category: 'electric',
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الحي الرئيسي',
    hours: '8:00 - 19:00',
    phone: '0999333303',
    services: ['بطاريات', 'أسلاك', 'إنذار'],
    servicesEn: ['Batteries', 'Wiring', 'Alarm'],
    rating: 4.6,
    reviews: 95,
    available: true
  },
  // إطارات
  {
    id: 'dtr1',
    name: 'إطارات الضاحية',
    nameEn: 'Dahia Tires',
    type: 'إطارات وجنوط',
    typeEn: 'Tires & Rims',
    category: 'tires',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '8:00 - 19:00',
    phone: '0999444403',
    services: ['بيع', 'تركيب', 'إصلاح'],
    servicesEn: ['Sales', 'Installation', 'Repair'],
    rating: 4.5,
    reviews: 88,
    available: true
  },
  // دهان
  {
    id: 'dpt1',
    name: 'دهان الضاحية',
    nameEn: 'Dahia Car Painting',
    type: 'دهان سيارات',
    typeEn: 'Car Painting',
    category: 'paint',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المنطقة الصناعية',
    hours: '8:00 - 17:00',
    phone: '0999555503',
    services: ['دهان', 'صقل', 'كفر'],
    servicesEn: ['Painting', 'Polishing', 'Bumper'],
    rating: 4.6,
    reviews: 72,
    available: true
  },
  // قطع غيار
  {
    id: 'dpr1',
    name: 'قطع غيار الضاحية',
    nameEn: 'Dahia Spare Parts',
    type: 'قطع غيار',
    typeEn: 'Spare Parts',
    category: 'parts',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - الساحة',
    hours: '8:00 - 19:00',
    phone: '0999666602',
    services: ['قطع غيار', 'زيوت', 'فلاتر'],
    servicesEn: ['Spare Parts', 'Oils', 'Filters'],
    rating: 4.5,
    reviews: 92,
    featured: true,
    available: true
  },
  // فحص سيارات
  {
    id: 'din1',
    name: 'فحص السيارات الشامل',
    nameEn: 'Comprehensive Car Inspection',
    type: 'فحص سيارات',
    typeEn: 'Car Inspection',
    category: 'inspection',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
    location: 'الضاحية - المدخل',
    hours: '8:00 - 15:00',
    phone: '0999777702',
    services: ['فحص شامل', 'فحص كمبيوتر'],
    servicesEn: ['Full Inspection', 'Computer Check'],
    rating: 4.7,
    reviews: 65,
    available: true
  }
];

const dataByRegion: Record<Region, CarService[]> = {
  'qudsaya-center': qudsayaCenterServices,
  'qudsaya-dahia': qudsayaDahiaServices
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Car },
  { id: 'carwash', name: 'مغاسل', nameEn: 'Car Wash', icon: Droplets },
  { id: 'mechanic', name: 'ميكانيك', nameEn: 'Mechanic', icon: Wrench },
  { id: 'electric', name: 'كهرباء', nameEn: 'Electric', icon: Battery },
  { id: 'tires', name: 'إطارات', nameEn: 'Tires', icon: CircleDot },
  { id: 'paint', name: 'دهان', nameEn: 'Painting', icon: Paintbrush },
  { id: 'parts', name: 'قطع غيار', nameEn: 'Parts', icon: Settings },
  { id: 'inspection', name: 'فحص', nameEn: 'Inspection', icon: ClipboardCheck },
];

export default function CarServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const services = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredServices = services.filter(service => {
    return activeCategory === 'all' || service.category === activeCategory;
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
  }, [filteredServices]);

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
    <section className="py-4 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-200">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'خدمات السيارات' : 'Car Services'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredServices.length} خدمة في ${regionName}` : `${filteredServices.length} services in ${regionName}`}
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
              ? services.length 
              : services.filter(s => s.category === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[55px] transition-all ${
                  isActive 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[8px] ${isActive ? 'text-sky-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredServices.slice(0, 8).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-sky-500 w-4' : 'bg-gray-300'
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
            {filteredServices.map((service, index) => {
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
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-600 text-white">
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>

                    {/* Featured/New/Available Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {service.available !== false && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          {isArabic ? 'متاح' : 'Open'}
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
                    {/* Rating */}
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
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">
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
                      className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
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
