'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Newspaper, Clock, ArrowLeft, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  image: string;
}

const qudsayaCenterNews: NewsItem[] = [
  {
    id: '1',
    title: 'انقطاع الكهرباء عن حي المركز',
    titleEn: 'Power outage in Center district',
    summary: 'لأعمال صيانة طارئة حتى الساعة 6 مساءً',
    summaryEn: 'Emergency maintenance until 6 PM',
    time: 'منذ 30 دقيقة',
    type: 'alert',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    title: 'افتتاح مركز خدمات جديد في قدسيا',
    titleEn: 'New service center opened in Qudsaya',
    summary: 'مركز خدمات إلكترونية في منطقة الساحة',
    summaryEn: 'Electronic services center in Square area',
    time: 'منذ ساعة',
    type: 'success',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    title: 'تحديث: عودة الماء لجميع الأحياء',
    titleEn: 'Update: Water restored',
    summary: 'بعد انتهاء أعمال الصيانة المقررة',
    summaryEn: 'After scheduled maintenance completed',
    time: 'منذ ساعتين',
    type: 'info',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    title: 'إعلان هام: تغيير مواعيد العمل الرسمية',
    titleEn: 'Important: Official working hours changed',
    summary: 'الدوام الرسمي الجديد من 8 صباحاً حتى 3 عصراً',
    summaryEn: 'New working hours from 8 AM to 3 PM',
    time: 'منذ 3 ساعات',
    type: 'info',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    title: 'تنبيه: أجواء باردة متوقعة',
    titleEn: 'Alert: Cold weather expected',
    summary: 'انخفاض درجات الحرارة بمقدار 10 درجات',
    summaryEn: 'Temperature drop by 10 degrees',
    time: 'منذ 4 ساعات',
    type: 'alert',
    image: 'https://images.unsplash.com/photo-1517685352747-0e1f2029e5da?auto=format&fit=crop&w=600&q=80'
  }
];

const qudsayaDahiaNews: NewsItem[] = [
  {
    id: '1',
    title: 'إعلان عن إغلاق طريق رئيسي للصيانة',
    titleEn: 'Main road closure for maintenance',
    summary: 'طريق الضاحية الرئيسي مغلق حتى إشعار آخر',
    summaryEn: 'Main Dahia road closed until further notice',
    time: 'منذ 15 دقيقة',
    type: 'alert',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    title: 'فعالية ثقافية في مركز الضاحية',
    titleEn: 'Cultural event at Dahia Center',
    summary: 'أمسية شعرية وموسيقية يوم الجمعة',
    summaryEn: 'Poetry and music evening on Friday',
    time: 'منذ ساعتين',
    type: 'success',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    title: 'تحديث: افتتاح مدرسة جديدة',
    titleEn: 'Update: New school opened',
    summary: 'مدرسة نموذجية في الحي الغربي',
    summaryEn: 'Model school in West district',
    time: 'منذ 3 ساعات',
    type: 'info',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    title: 'نجاح حملة تنظيف الأحياء',
    titleEn: 'Neighborhood cleanup campaign success',
    summary: 'مشاركة أكثر من 200 متطوع',
    summaryEn: 'Over 200 volunteers participated',
    time: 'منذ 5 ساعات',
    type: 'success',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    title: 'تنبيه: صيانة شبكة الإنترنت',
    titleEn: 'Alert: Internet maintenance',
    summary: 'انقطاع محتمل لمدة ساعتين',
    summaryEn: 'Possible outage for 2 hours',
    time: 'منذ 6 ساعات',
    type: 'alert',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80'
  }
];

const dataByRegion: Record<Region, NewsItem[]> = {
  'qudsaya-center': qudsayaCenterNews,
  'qudsaya-dahia': qudsayaDahiaNews
};

const typeFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Newspaper, color: 'bg-gray-500' },
  { id: 'alert', name: 'تنبيهات', nameEn: 'Alerts', icon: AlertTriangle, color: 'bg-red-500' },
  { id: 'success', name: 'أخبار جيدة', nameEn: 'Good News', icon: CheckCircle, color: 'bg-green-500' },
  { id: 'info', name: 'تحديثات', nameEn: 'Updates', icon: Info, color: 'bg-blue-500' },
];

const typeStyles = {
  alert: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300', icon: AlertTriangle },
  success: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300', icon: CheckCircle },
  info: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300', icon: Info }
};

export default function LocalNews() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const newsItems = dataByRegion[region];

  const [activeType, setActiveType] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredNews = newsItems.filter(n => 
    activeType === 'all' || n.type === activeType
  );

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
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
  }, [filteredNews]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? `أخبار ${regionName}` : `${regionName} News`}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredNews.length} خبر` : `${filteredNews.length} news`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.id;
            const count = filter.id === 'all' 
              ? newsItems.length 
              : newsItems.filter(n => n.type === filter.id).length;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[65px] transition-all ${
                  isActive 
                    ? 'bg-violet-500 text-white' 
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

        {/* Scroll Hint */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {filteredNews.slice(0, 5).map((_, idx) => (
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

          {/* Scrollable Cards */}
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
            {filteredNews.map((item, index) => {
              const TypeIcon = typeStyles[item.type].icon;
              const styles = typeStyles[item.type];
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer group"
                >
                  {/* Card */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Type Badge */}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 ${styles.bg} ${styles.text} text-[10px] font-bold rounded-full flex items-center gap-1`}>
                        <TypeIcon className="w-3 h-3" />
                        {item.type === 'alert' ? (isArabic ? 'تنبيه' : 'Alert') :
                         item.type === 'success' ? (isArabic ? 'جديد' : 'Good') : (isArabic ? 'تحديث' : 'Update')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                        {isArabic ? item.title : item.titleEn}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {isArabic ? item.summary : item.summaryEn}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.time}</span>
                      </div>
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
