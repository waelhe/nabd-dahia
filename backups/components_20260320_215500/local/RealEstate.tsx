'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building, Bed, Bath, Maximize, Heart, Star, Home, Landmark, Building2, Warehouse, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Property {
  id: string;
  title: string;
  titleEn: string;
  type: string;
  typeEn: string;
  category: 'apartment' | 'villa' | 'office' | 'land' | 'shop';
  categoryAr: string;
  categoryEn: string;
  price: string;
  priceUnit?: string;
  priceUnitEn?: string;
  location: string;
  locationEn: string;
  images: string[];
  beds: number;
  baths: number;
  area: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  new?: boolean;
}

const qudsayaCenterProperties: Property[] = [
  {
    id: '1',
    title: 'شقة فاخرة إطلالة رائعة',
    titleEn: 'Luxury Apartment with Amazing View',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '280,000',
    location: 'قدسيا - الحي الغربي',
    locationEn: 'Qudsaya - West District',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 4,
    baths: 2,
    area: 180,
    rating: 4.9,
    reviews: 23,
    featured: true
  },
  {
    id: '2',
    title: 'شقة عصرية للإيجار',
    titleEn: 'Modern Apartment for Rent',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '450',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'قدسيا - المركز',
    locationEn: 'Qudsaya - Center',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 3,
    baths: 2,
    area: 120,
    rating: 4.7,
    reviews: 15,
    new: true
  },
  {
    id: '3',
    title: 'فيلا فاخرة مع حديقة خاصة',
    titleEn: 'Luxury Villa with Private Garden',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'villa',
    categoryAr: 'فيلا',
    categoryEn: 'Villa',
    price: '950,000',
    location: 'قدسيا - الحي الجنوبي',
    locationEn: 'Qudsaya - South District',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 6,
    baths: 4,
    area: 380,
    rating: 5.0,
    reviews: 42,
    featured: true
  },
  {
    id: '4',
    title: 'مكتب تجاري موقع مميز',
    titleEn: 'Commercial Office Prime Location',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'office',
    categoryAr: 'مكتب',
    categoryEn: 'Office',
    price: '700',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'قدسيا - الساحة',
    locationEn: 'Qudsaya - Square',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 1,
    area: 80,
    rating: 4.5,
    reviews: 8
  },
  {
    id: '5',
    title: 'شقة غرفة وصالة جديدة',
    titleEn: 'New One Bedroom Apartment',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '280',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'قدسيا - الحي الشرقي',
    locationEn: 'Qudsaya - East District',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 1,
    baths: 1,
    area: 65,
    rating: 4.6,
    reviews: 12,
    new: true
  },
  {
    id: '6',
    title: 'محل تجاري للإيجار',
    titleEn: 'Commercial Shop for Rent',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'shop',
    categoryAr: 'محل',
    categoryEn: 'Shop',
    price: '550',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'قدسيا - الشارع الرئيسي',
    locationEn: 'Qudsaya - Main Street',
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 1,
    area: 45,
    rating: 4.3,
    reviews: 6
  },
  {
    id: '7',
    title: 'أرض سكنية للبيع',
    titleEn: 'Residential Land for Sale',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'land',
    categoryAr: 'أرض',
    categoryEn: 'Land',
    price: '120,000',
    location: 'قدسيا - المنطقة الخضراء',
    locationEn: 'Qudsaya - Green Zone',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 0,
    area: 500,
    rating: 4.8,
    reviews: 5
  },
  {
    id: '8',
    title: 'دوبلكس فاخر 240م²',
    titleEn: 'Luxury Duplex 240m²',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '420,000',
    location: 'قدسيا - برج الورود',
    locationEn: 'Qudsaya - Al Ward Tower',
    images: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 5,
    baths: 3,
    area: 240,
    rating: 4.9,
    reviews: 18,
    featured: true
  }
];

const qudsayaDahiaProperties: Property[] = [
  {
    id: '1',
    title: 'شقة عصرية 150م²',
    titleEn: 'Modern Apartment 150m²',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '250,000',
    location: 'الضاحية - الحي الغربي',
    locationEn: 'Dahia - West District',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 3,
    baths: 2,
    area: 150,
    rating: 4.7,
    reviews: 19
  },
  {
    id: '2',
    title: 'شقة للإيجار قريبة من الخدمات',
    titleEn: 'Apartment for Rent Near Services',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '500',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'الضاحية - الحي الرئيسي',
    locationEn: 'Dahia - Main District',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 3,
    baths: 2,
    area: 120,
    rating: 4.5,
    reviews: 14
  },
  {
    id: '3',
    title: 'فيلا مع مسبح خاص',
    titleEn: 'Villa with Private Pool',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'villa',
    categoryAr: 'فيلا',
    categoryEn: 'Villa',
    price: '1,200,000',
    location: 'الضاحية - الحي الجنوبي',
    locationEn: 'Dahia - South District',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 7,
    baths: 5,
    area: 450,
    rating: 5.0,
    reviews: 35,
    featured: true
  },
  {
    id: '4',
    title: 'مكتب في مركز تجاري',
    titleEn: 'Office in Commercial Center',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'office',
    categoryAr: 'مكتب',
    categoryEn: 'Office',
    price: '800',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'الضاحية - المركز التجاري',
    locationEn: 'Dahia - Commercial Center',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 1,
    area: 100,
    rating: 4.6,
    reviews: 11
  },
  {
    id: '5',
    title: 'شقة صغيرة للعزاب',
    titleEn: 'Small Apartment for Singles',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '200',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'الضاحية - الحي الشمالي',
    locationEn: 'Dahia - North District',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 1,
    baths: 1,
    area: 50,
    rating: 4.4,
    reviews: 9,
    new: true
  },
  {
    id: '6',
    title: 'محل زاوية للإيجار',
    titleEn: 'Corner Shop for Rent',
    type: 'للإيجار',
    typeEn: 'For Rent',
    category: 'shop',
    categoryAr: 'محل',
    categoryEn: 'Shop',
    price: '650',
    priceUnit: '/شهر',
    priceUnitEn: '/month',
    location: 'الضاحية - الساحة',
    locationEn: 'Dahia - Square',
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 1,
    area: 60,
    rating: 4.2,
    reviews: 7
  },
  {
    id: '7',
    title: 'مستودع كبير للبيع',
    titleEn: 'Large Warehouse for Sale',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'land',
    categoryAr: 'مستودع',
    categoryEn: 'Warehouse',
    price: '180,000',
    location: 'الضاحية - المنطقة الصناعية',
    locationEn: 'Dahia - Industrial Zone',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 0,
    baths: 1,
    area: 300,
    rating: 4.0,
    reviews: 4
  },
  {
    id: '8',
    title: 'شقة طابق أول 200م²',
    titleEn: 'First Floor Apartment 200m²',
    type: 'للبيع',
    typeEn: 'For Sale',
    category: 'apartment',
    categoryAr: 'شقة',
    categoryEn: 'Apartment',
    price: '380,000',
    location: 'الضاحية - مجمع اليمامة',
    locationEn: 'Dahia - Al Yamama Complex',
    images: [
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    ],
    beds: 4,
    baths: 3,
    area: 200,
    rating: 4.8,
    reviews: 16,
    featured: true
  }
];

const dataByRegion: Record<Region, Property[]> = {
  'qudsaya-center': qudsayaCenterProperties,
  'qudsaya-dahia': qudsayaDahiaProperties
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Home },
  { id: 'apartment', name: 'شقق', nameEn: 'Apartments', icon: Building },
  { id: 'villa', name: 'فلل', nameEn: 'Villas', icon: Landmark },
  { id: 'office', name: 'مكاتب', nameEn: 'Offices', icon: Building2 },
  { id: 'shop', name: 'محلات', nameEn: 'Shops', icon: Store },
  { id: 'land', name: 'أراضي', nameEn: 'Lands', icon: Warehouse },
];

export default function RealEstate() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const properties = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProperties = properties.filter(property => {
    return activeCategory === 'all' || property.category === activeCategory;
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
  }, [filteredProperties]);

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

  const nextImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg shadow-teal-200">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'العقارات والإعلانات' : 'Real Estate & Classifieds'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredProperties.length} عقار في ${regionName}` : `${filteredProperties.length} properties in ${regionName}`}
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
              ? properties.length 
              : properties.filter(p => p.category === filter.id).length;
            
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

        {/* تلميح للمستخدم */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredProperties.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-teal-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Container - محسن */}
        <div className="relative">
          {/* Left Navigation Button - دائم */}
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

          {/* Right Navigation Button - دائم */}
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
            {filteredProperties.map((property, index) => {
              const isFavorite = favorites.includes(property.id);
              const imageIndex = currentImageIndex[property.id] || 0;
              
              return (
                <div
                  key={property.id}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img 
                      src={property.images[imageIndex]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Image Navigation */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(property.id, property.images.length); }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(property.id, property.images.length); }}
                          className="absolute left-auto right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {property.images.map((_, idx) => (
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
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
                      className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        property.type === 'للبيع' 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {isArabic ? property.type : property.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    {(property.featured || property.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          property.featured ? 'bg-white/90 text-gray-900' : 'bg-emerald-500 text-white'
                        }`}>
                          {property.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="px-1">
                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {isArabic ? property.location : property.locationEn}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
                        <span className="text-[10px] font-bold">{property.rating}</span>
                        <span className="text-[10px] text-gray-400">({property.reviews})</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {isArabic ? property.title : property.titleEn}
                    </h3>

                    {/* Features */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                      {property.beds > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Bed className="w-3 h-3" />
                          {property.beds}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Bath className="w-3 h-3" />
                        {property.baths}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Maximize className="w-3 h-3" />
                        {property.area}م²
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-gray-900">$</span>
                      <span className="text-sm font-black text-gray-900">{property.price}</span>
                      {property.priceUnit && (
                        <span className="text-[10px] text-gray-500">
                          {isArabic ? property.priceUnit : property.priceUnitEn}
                        </span>
                      )}
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
