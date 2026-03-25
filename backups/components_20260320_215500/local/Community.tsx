'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Users, HandHeart, Gift, Calendar, MapPin, Star, ChevronLeft, ChevronRight, Sparkles, Trophy, GraduationCap, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface CommunityService {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  category: 'charity' | 'youth' | 'volunteering' | 'education' | 'social' | 'sports';
  icon: React.ElementType;
  color: string;
  description: string;
  descriptionEn: string;
  image: string;
  members?: number;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  new?: boolean;
}

interface VolunteerOpp {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  location: string;
}

const qudsayaCenterServices: CommunityService[] = [
  {
    id: '1',
    name: 'جمعية البر الخيرية - قدسيا',
    nameEn: 'Al-Birr Charity - Qudsaya',
    type: 'خيري',
    typeEn: 'Charity',
    category: 'charity',
    icon: HandHeart,
    color: 'bg-rose-600',
    description: 'مساعدة الأسر المحتاجة في قدسيا',
    descriptionEn: 'Helping needy families in Qudsaya',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    members: 250,
    rating: 4.9,
    reviews: 45,
    featured: true
  },
  {
    id: '2',
    name: 'مركز شباب قدسيا',
    nameEn: 'Qudsaya Youth Center',
    type: 'شبابي',
    typeEn: 'Youth',
    category: 'youth',
    icon: Users,
    color: 'bg-violet-600',
    description: 'أنشطة وبرامج شبابية متنوعة',
    descriptionEn: 'Diverse youth activities and programs',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    members: 180,
    rating: 4.7,
    reviews: 32,
    new: true
  },
  {
    id: '3',
    name: 'بنك طعام قدسيا',
    nameEn: 'Qudsaya Food Bank',
    type: 'إنساني',
    typeEn: 'Humanitarian',
    category: 'charity',
    icon: Gift,
    color: 'bg-orange-600',
    description: 'توزيع الطعام للمحتاجين أسبوعياً',
    descriptionEn: 'Weekly food distribution for needy',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    members: 120,
    rating: 4.8,
    reviews: 28
  },
  {
    id: '4',
    name: 'جمعية الأمل - قدسيا',
    nameEn: 'Al-Amal Association - Qudsaya',
    type: 'اجتماعي',
    typeEn: 'Social',
    category: 'social',
    icon: Heart,
    color: 'bg-pink-600',
    description: 'دعم ذوي الاحتياجات الخاصة',
    descriptionEn: 'Support for people with special needs',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    members: 85,
    rating: 4.9,
    reviews: 22,
    featured: true
  },
  {
    id: '5',
    name: 'نادي رياضي قدسيا',
    nameEn: 'Qudsaya Sports Club',
    type: 'رياضي',
    typeEn: 'Sports',
    category: 'sports',
    icon: Trophy,
    color: 'bg-emerald-600',
    description: 'فريق كرة قدم وأنشطة رياضية',
    descriptionEn: 'Football team and sports activities',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    members: 320,
    rating: 4.6,
    reviews: 56,
    new: true
  },
  {
    id: '6',
    name: 'مركز التعليم المستمر',
    nameEn: 'Continuous Learning Center',
    type: 'تعليمي',
    typeEn: 'Education',
    category: 'education',
    icon: GraduationCap,
    color: 'bg-blue-600',
    description: 'دورات تعليمية وتدريبية مجانية',
    descriptionEn: 'Free educational and training courses',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    members: 200,
    rating: 4.8,
    reviews: 38
  },
  {
    id: '7',
    name: 'فريق التطوع المجتمعي',
    nameEn: 'Community Volunteer Team',
    type: 'تطوعي',
    typeEn: 'Volunteering',
    category: 'volunteering',
    icon: Sparkles,
    color: 'bg-amber-600',
    description: 'مبادرات تطوعية أسبوعية',
    descriptionEn: 'Weekly volunteer initiatives',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    members: 150,
    rating: 4.7,
    reviews: 42
  },
  {
    id: '8',
    name: 'جمعية رعاية المسنين',
    nameEn: 'Elderly Care Association',
    type: 'خيري',
    typeEn: 'Charity',
    category: 'charity',
    icon: HandHeart,
    color: 'bg-teal-600',
    description: 'رعاية وكبار السن في المنطقة',
    descriptionEn: 'Care for the elderly in the area',
    image: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80',
    members: 75,
    rating: 4.9,
    reviews: 18,
    featured: true
  }
];

const qudsayaDahiaServices: CommunityService[] = [
  {
    id: '1',
    name: 'جمعية البر الخيرية - الضاحية',
    nameEn: 'Al-Birr Charity - Dahia',
    type: 'خيري',
    typeEn: 'Charity',
    category: 'charity',
    icon: HandHeart,
    color: 'bg-rose-600',
    description: 'مساعدة الأسر المحتاجة في الضاحية',
    descriptionEn: 'Helping needy families in Dahia',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    members: 280,
    rating: 4.8,
    reviews: 52,
    featured: true
  },
  {
    id: '2',
    name: 'مركز شباب الضاحية',
    nameEn: 'Dahia Youth Center',
    type: 'شبابي',
    typeEn: 'Youth',
    category: 'youth',
    icon: Users,
    color: 'bg-violet-600',
    description: 'أنشطة وبرامج شبابية متنوعة',
    descriptionEn: 'Diverse youth activities and programs',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    members: 210,
    rating: 4.6,
    reviews: 35,
    new: true
  },
  {
    id: '3',
    name: 'بنك طعام الضاحية',
    nameEn: 'Dahia Food Bank',
    type: 'إنساني',
    typeEn: 'Humanitarian',
    category: 'charity',
    icon: Gift,
    color: 'bg-orange-600',
    description: 'توزيع الطعام للمحتاجين أسبوعياً',
    descriptionEn: 'Weekly food distribution for needy',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    members: 145,
    rating: 4.7,
    reviews: 30
  },
  {
    id: '4',
    name: 'جمعية الأمل - الضاحية',
    nameEn: 'Al-Amal Association - Dahia',
    type: 'اجتماعي',
    typeEn: 'Social',
    category: 'social',
    icon: Heart,
    color: 'bg-pink-600',
    description: 'دعم ذوي الاحتياجات الخاصة',
    descriptionEn: 'Support for people with special needs',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    members: 95,
    rating: 4.9,
    reviews: 25
  },
  {
    id: '5',
    name: 'نادي رياضي الضاحية',
    nameEn: 'Dahia Sports Club',
    type: 'رياضي',
    typeEn: 'Sports',
    category: 'sports',
    icon: Trophy,
    color: 'bg-emerald-600',
    description: 'فريق كرة قدم وأنشطة رياضية',
    descriptionEn: 'Football team and sports activities',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    members: 350,
    rating: 4.7,
    reviews: 62,
    featured: true
  },
  {
    id: '6',
    name: 'مركز التدريب المهني',
    nameEn: 'Vocational Training Center',
    type: 'تعليمي',
    typeEn: 'Education',
    category: 'education',
    icon: GraduationCap,
    color: 'bg-blue-600',
    description: 'تدريب مهني وورش عمل',
    descriptionEn: 'Vocational training and workshops',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    members: 180,
    rating: 4.6,
    reviews: 40,
    new: true
  },
  {
    id: '7',
    name: 'فريق العمل التطوعي',
    nameEn: 'Volunteer Action Team',
    type: 'تطوعي',
    typeEn: 'Volunteering',
    category: 'volunteering',
    icon: Sparkles,
    color: 'bg-amber-600',
    description: 'مبادرات تطوعية متنوعة',
    descriptionEn: 'Various volunteer initiatives',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    members: 165,
    rating: 4.8,
    reviews: 48
  },
  {
    id: '8',
    name: 'جمعية رعاية الأيتام',
    nameEn: 'Orphan Care Association',
    type: 'خيري',
    typeEn: 'Charity',
    category: 'charity',
    icon: HandHeart,
    color: 'bg-teal-600',
    description: 'رعاية وكفالة الأيتام',
    descriptionEn: 'Care and sponsorship for orphans',
    image: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80',
    members: 110,
    rating: 5.0,
    reviews: 20,
    featured: true
  }
];

const volunteerOpportunities: VolunteerOpp[] = [
  {
    id: '1',
    title: 'توزيع طرود غذائية',
    titleEn: 'Food Package Distribution',
    date: 'كل سبت',
    location: 'مركز الجمعية'
  },
  {
    id: '2',
    title: 'دروس تقوية مجانية',
    titleEn: 'Free Tutoring',
    date: 'يومياً',
    location: 'المركز الثقافي'
  }
];

const dataByRegion: Record<Region, CommunityService[]> = {
  'qudsaya-center': qudsayaCenterServices,
  'qudsaya-dahia': qudsayaDahiaServices
};

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Briefcase },
  { id: 'charity', name: 'خيري', nameEn: 'Charity', icon: HandHeart },
  { id: 'youth', name: 'شبابي', nameEn: 'Youth', icon: Users },
  { id: 'volunteering', name: 'تطوعي', nameEn: 'Volunteering', icon: Sparkles },
  { id: 'education', name: 'تعليمي', nameEn: 'Education', icon: GraduationCap },
  { id: 'sports', name: 'رياضي', nameEn: 'Sports', icon: Trophy },
  { id: 'social', name: 'اجتماعي', nameEn: 'Social', icon: Heart },
];

export default function Community() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const communityServices = dataByRegion[region];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredServices = communityServices.filter(service => {
    return activeCategory === 'all' || service.category === activeCategory;
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
  }, [filteredServices]);

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
    <section className="py-4 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'المجتمع' : 'Community'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredServices.length} خدمة في ${regionName}` : `${filteredServices.length} services in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Category Filters - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? communityServices.length 
              : communityServices.filter(s => s.category === filter.id).length;
            
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
            {filteredServices.map((_, idx) => (
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
            {filteredServices.map((service, index) => {
              const isFavorite = favorites.includes(service.id);
              const Icon = service.icon;
              
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
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${service.color} text-white`}>
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>

                    {/* Featured/New Badge */}
                    {(service.featured || service.new) && (
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          service.featured ? 'bg-white/90 text-gray-900' : 'bg-emerald-500 text-white'
                        }`}>
                          {service.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'جديد' : 'New')}
                        </span>
                      </div>
                    )}

                    {/* Icon on Image */}
                    <div className="absolute bottom-2 left-2">
                      <div className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="px-1">
                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {service.members} {isArabic ? 'عضو' : 'members'}
                      </span>
                      {service.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold">{service.rating}</span>
                          <span className="text-[10px] text-gray-400">({service.reviews})</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {isArabic ? service.name : service.nameEn}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {isArabic ? service.description : service.descriptionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteer Opportunities */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <HandHeart className="w-5 h-5 text-white" />
            <span className="text-white font-bold">{isArabic ? 'فرص تطوعية' : 'Volunteer Opportunities'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {volunteerOpportunities.map((opp) => (
              <div key={opp.id} className="bg-white/20 backdrop-blur rounded-xl p-3">
                <h4 className="text-white font-medium text-sm mb-2">{isArabic ? opp.title : opp.titleEn}</h4>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{opp.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{opp.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
