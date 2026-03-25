'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Users, Gift, HandHeart, Phone, MapPin, Clock, Droplets, ChevronLeft, ChevronRight, AlertCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Charity {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  icon: React.ElementType;
  color: string;
  description: string;
  descriptionEn: string;
  phone: string;
  location: string;
  featured?: boolean;
  urgent?: boolean;
}

interface Campaign {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ElementType;
  target: string;
  current: string;
  progress: number;
}

const qudsayaCenterCharities: Charity[] = [
  {
    id: '1',
    name: 'جمعية البر الخيرية',
    nameEn: 'Al-Birr Charity',
    type: 'إغاثة',
    typeEn: 'Relief',
    icon: HandHeart,
    color: 'bg-rose-600',
    description: 'مساعدة الأسر المحتاجة واليتامى في قدسيا',
    descriptionEn: 'Helping needy families and orphans in Qudsaya',
    phone: '011-1234567',
    location: 'قدسيا - الحي الرئيسي',
    featured: true
  },
  {
    id: '2',
    name: 'بنك الطعام قدسيا',
    nameEn: 'Qudsaya Food Bank',
    type: 'غذائي',
    typeEn: 'Food',
    icon: Gift,
    color: 'bg-orange-600',
    description: 'توزيع الطعام على المحتاجين',
    descriptionEn: 'Food distribution to the needy',
    phone: '011-2345678',
    location: 'قدسيا - الساحة',
    urgent: true
  },
  {
    id: '3',
    name: 'مؤسسة الأمل',
    nameEn: 'Al-Amal Foundation',
    type: 'صحي',
    typeEn: 'Health',
    icon: Heart,
    color: 'bg-red-600',
    description: 'علاج المرضى المحتاجين',
    descriptionEn: 'Treating needy patients',
    phone: '011-3456789',
    location: 'قدسيا'
  },
  {
    id: '4',
    name: 'جمعية التعليم الخيري',
    nameEn: 'Charity Education Association',
    type: 'تعليم',
    typeEn: 'Education',
    icon: Users,
    color: 'bg-blue-600',
    description: 'دعم تعليم الطلاب المحتاجين',
    descriptionEn: 'Supporting needy students education',
    phone: '011-4567890',
    location: 'قدسيا',
    featured: true
  },
  {
    id: '5',
    name: 'جمعية الإحسان',
    nameEn: 'Al-Ihsan Association',
    type: 'إغاثة',
    typeEn: 'Relief',
    icon: HandHeart,
    color: 'bg-pink-600',
    description: 'كفالة الأيتام والأرامل',
    descriptionEn: 'Sponsoring orphans and widows',
    phone: '011-5678901',
    location: 'قدسيا - الحي الشرقي'
  },
  {
    id: '6',
    name: 'مركز الرعاية الاجتماعية',
    nameEn: 'Social Care Center',
    type: 'صحي',
    typeEn: 'Health',
    icon: Heart,
    color: 'bg-purple-600',
    description: 'رعاية المسنين والمعاقين',
    descriptionEn: 'Caring for elderly and disabled',
    phone: '011-6789012',
    location: 'قدسيا - الحي الغربي',
    urgent: true
  }
];

const qudsayaDahiaCharities: Charity[] = [
  {
    id: '1',
    name: 'جمعية الخير الخيرية',
    nameEn: 'Al-Kheir Charity',
    type: 'إغاثة',
    typeEn: 'Relief',
    icon: HandHeart,
    color: 'bg-rose-600',
    description: 'مساعدة الأسر المحتاجة في الضاحية',
    descriptionEn: 'Helping needy families in Dahia',
    phone: '011-2234567',
    location: 'الضاحية - الحي الرئيسي',
    featured: true
  },
  {
    id: '2',
    name: 'بنك الطعام الضاحية',
    nameEn: 'Dahia Food Bank',
    type: 'غذائي',
    typeEn: 'Food',
    icon: Gift,
    color: 'bg-orange-600',
    description: 'توزيع الطعام على المحتاجين',
    descriptionEn: 'Food distribution to the needy',
    phone: '011-3345678',
    location: 'الضاحية - المركز',
    urgent: true
  },
  {
    id: '3',
    name: 'جمعية الشفاء',
    nameEn: 'Al-Shifa Association',
    type: 'صحي',
    typeEn: 'Health',
    icon: Heart,
    color: 'bg-red-600',
    description: 'رعاية صحية مجانية',
    descriptionEn: 'Free healthcare',
    phone: '011-4456789',
    location: 'الضاحية'
  },
  {
    id: '4',
    name: 'جمعية النور التعليمية',
    nameEn: 'Al-Noor Education',
    type: 'تعليم',
    typeEn: 'Education',
    icon: Users,
    color: 'bg-blue-600',
    description: 'دروس مجانية للطلاب',
    descriptionEn: 'Free tutoring for students',
    phone: '011-5567890',
    location: 'الضاحية',
    featured: true
  },
  {
    id: '5',
    name: 'جمعية البركة',
    nameEn: 'Al-Baraka Association',
    type: 'غذائي',
    typeEn: 'Food',
    icon: Gift,
    color: 'bg-amber-600',
    description: 'مشروع وليمة الحب',
    descriptionEn: 'Love Feast Project',
    phone: '011-6678901',
    location: 'الضاحية - الساحة'
  },
  {
    id: '6',
    name: 'مؤسسة الرحمة',
    nameEn: 'Al-Rahma Foundation',
    type: 'إغاثة',
    typeEn: 'Relief',
    icon: HandHeart,
    color: 'bg-teal-600',
    description: 'إغاثة الطوارئ للعائلات',
    descriptionEn: 'Emergency relief for families',
    phone: '011-7789012',
    location: 'الضاحية - الحي الجنوبي',
    urgent: true
  }
];

const qudsayaCenterCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'سقيا الماء',
    titleEn: 'Water Wells',
    icon: Droplets,
    target: '50,000$',
    current: '35,000$',
    progress: 70
  },
  {
    id: '2',
    title: 'كسوة العيد',
    titleEn: 'Eid Clothing',
    icon: Gift,
    target: '20,000$',
    current: '16,000$',
    progress: 80
  }
];

const qudsayaDahiaCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'إفطار صائم',
    titleEn: 'Ramadan Iftar',
    icon: Gift,
    target: '30,000$',
    current: '22,000$',
    progress: 73
  },
  {
    id: '2',
    title: 'علاج المرضى',
    titleEn: 'Medical Treatment',
    icon: Heart,
    target: '40,000$',
    current: '28,000$',
    progress: 70
  }
];

const dataByRegion: Record<Region, { charities: Charity[]; campaigns: Campaign[] }> = {
  'qudsaya-center': { charities: qudsayaCenterCharities, campaigns: qudsayaCenterCampaigns },
  'qudsaya-dahia': { charities: qudsayaDahiaCharities, campaigns: qudsayaDahiaCampaigns }
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: HandHeart },
  { id: 'إغاثة', name: 'إغاثة', nameEn: 'Relief', icon: HandHeart },
  { id: 'غذائي', name: 'غذائي', nameEn: 'Food', icon: Gift },
  { id: 'صحي', name: 'صحي', nameEn: 'Health', icon: Heart },
  { id: 'تعليم', name: 'تعليم', nameEn: 'Education', icon: Users },
];

export default function Charity() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const { charities, campaigns } = dataByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCharities = charities.filter(charity => {
    return activeType === 'all' || charity.type === activeType;
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
  }, [filteredCharities]);

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
    <section className="py-4 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-200">
              <HandHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المؤسسات الخيرية' : 'Charity Organizations'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredCharities.length} مؤسسة في ${regionName}` : `${filteredCharities.length} organizations in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Type Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.id;
            const count = filter.id === 'all'
              ? charities.length
              : charities.filter(c => c.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
                    : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[9px] ${isActive ? 'text-pink-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredCharities.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-pink-500 w-4' : 'bg-gray-300'
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
                ? 'opacity-100 hover:scale-110 hover:bg-pink-50'
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
                ? 'opacity-100 hover:scale-110 hover:bg-pink-50 animate-pulse'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Scrollable Cards Container with gradient mask */}
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
            {filteredCharities.map((charity, index) => {
              const Icon = charity.icon;
              const isFavorite = favorites.includes(charity.id);

              return (
                <div
                  key={charity.id}
                  className="flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Container */}
                  <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl overflow-hidden transition-all duration-300 hover:border-pink-200">
                    {/* Header with Icon */}
                    <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(charity.id); }}
                        className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                      >
                        <Heart
                          className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}
                        />
                      </button>

                      {/* Featured/Urgent Badge */}
                      {(charity.featured || charity.urgent) && (
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                            charity.featured
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                              : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                            {charity.featured ? (
                              <>
                                <Star className="w-3 h-3" />
                                {isArabic ? 'مميز' : 'Featured'}
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                {isArabic ? 'عاجل' : 'Urgent'}
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-14 h-14 ${charity.color} rounded-xl flex items-center justify-center mx-auto mt-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Type Badge */}
                      <div className="flex justify-center mt-3">
                        <span className="text-[10px] px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                          {isArabic ? charity.type : charity.typeEn}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                        {isArabic ? charity.name : charity.nameEn}
                      </h3>
                      <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2">
                        {isArabic ? charity.description : charity.descriptionEn}
                      </p>

                      {/* Location */}
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{charity.location}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-xs font-medium transition-colors">
                          <Phone className="w-3 h-3" />
                          {isArabic ? 'اتصل' : 'Call'}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 bg-white border border-pink-600 text-pink-600 hover:bg-pink-50 py-2 rounded-lg text-xs font-medium transition-colors">
                          <HandHeart className="w-3 h-3" />
                          {isArabic ? 'تبرع' : 'Donate'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-white" />
            <span className="text-white font-bold">{isArabic ? 'حملات نشطة' : 'Active Campaigns'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {campaigns.map((campaign) => {
              const Icon = campaign.icon;
              return (
                <div key={campaign.id} className="bg-white/20 backdrop-blur rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium text-sm">
                      {isArabic ? campaign.title : campaign.titleEn}
                    </span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-white rounded-full" style={{ width: `${campaign.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>{campaign.current}</span>
                    <span>{isArabic ? 'الهدف:' : 'Target:'} {campaign.target}</span>
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
