'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Apple, Carrot, Beef, Milk, Wheat, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';

interface MarketItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'vegetables' | 'fruits' | 'meat' | 'dairy' | 'legumes';
  price: number;
  unit: string;
  unitEn: string;
  change: 'up' | 'down' | 'stable';
  changePercent?: number;
}

// بيانات أسعار السوق
const marketItems: MarketItem[] = [
  // خضروات
  { id: 'v1', name: 'طماطم', nameEn: 'Tomato', category: 'vegetables', price: 1500, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 5 },
  { id: 'v2', name: 'خيار', nameEn: 'Cucumber', category: 'vegetables', price: 1200, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  { id: 'v3', name: 'بطاطا', nameEn: 'Potato', category: 'vegetables', price: 1000, unit: 'كيلو', unitEn: 'kg', change: 'down', changePercent: 3 },
  { id: 'v4', name: 'بصل', nameEn: 'Onion', category: 'vegetables', price: 800, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  { id: 'v5', name: 'خس', nameEn: 'Lettuce', category: 'vegetables', price: 2000, unit: 'حبة', unitEn: 'piece', change: 'up', changePercent: 10 },
  // فواكه
  { id: 'f1', name: 'تفاح', nameEn: 'Apple', category: 'fruits', price: 2500, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  { id: 'f2', name: 'موز', nameEn: 'Banana', category: 'fruits', price: 3000, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 8 },
  { id: 'f3', name: 'برتقال', nameEn: 'Orange', category: 'fruits', price: 1500, unit: 'كيلو', unitEn: 'kg', change: 'down', changePercent: 5 },
  { id: 'f4', name: 'عنب', nameEn: 'Grapes', category: 'fruits', price: 4000, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 12 },
  // لحوم
  { id: 'm1', name: 'لحم غنم', nameEn: 'Lamb Meat', category: 'meat', price: 45000, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 3 },
  { id: 'm2', name: 'لحم بقر', nameEn: 'Beef', category: 'meat', price: 35000, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  { id: 'm3', name: 'دجاج', nameEn: 'Chicken', category: 'meat', price: 12000, unit: 'كيلو', unitEn: 'kg', change: 'down', changePercent: 2 },
  // ألبان
  { id: 'd1', name: 'حليب', nameEn: 'Milk', category: 'dairy', price: 3000, unit: 'لتر', unitEn: 'liter', change: 'stable' },
  { id: 'd2', name: 'جبنة بيضاء', nameEn: 'White Cheese', category: 'dairy', price: 15000, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 5 },
  { id: 'd3', name: 'لبن', nameEn: 'Yogurt', category: 'dairy', price: 2500, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  // بقوليات
  { id: 'l1', name: 'أرز', nameEn: 'Rice', category: 'legumes', price: 5000, unit: 'كيلو', unitEn: 'kg', change: 'down', changePercent: 4 },
  { id: 'l2', name: 'عدس', nameEn: 'Lentils', category: 'legumes', price: 4000, unit: 'كيلو', unitEn: 'kg', change: 'stable' },
  { id: 'l3', name: 'فول', nameEn: 'Beans', category: 'legumes', price: 4500, unit: 'كيلو', unitEn: 'kg', change: 'up', changePercent: 2 },
];

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Apple },
  { id: 'vegetables', name: 'خضروات', nameEn: 'Vegetables', icon: Carrot },
  { id: 'fruits', name: 'فواكه', nameEn: 'Fruits', icon: Apple },
  { id: 'meat', name: 'لحوم', nameEn: 'Meat', icon: Beef },
  { id: 'dairy', name: 'ألبان', nameEn: 'Dairy', icon: Milk },
  { id: 'legumes', name: 'بقوليات', nameEn: 'Legumes', icon: Wheat },
];

export default function MarketPrices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { regionName } = useRegion();

  const [activeCategory, setActiveCategory] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredItems = marketItems.filter(item =>
    activeCategory === 'all' || item.category === activeCategory
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
  }, [filteredItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-SY');
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-green-500" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getChangeColor = (change: string) => {
    switch (change) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <section id="market-prices" className="py-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '💰 أسعار السوق' : '💰 Market Prices'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `${filteredItems.length} منتج - ${regionName}` : `${filteredItems.length} items - ${regionName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all'
              ? marketItems.length
              : marketItems.filter(i => i.category === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[10px] ${isActive ? 'text-emerald-200' : 'text-gray-400'}`}>{count}</span>
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
            {filteredItems.slice(0, 6).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-emerald-500 w-4' : 'bg-gray-300'
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
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollLeft
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollRight
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50 animate-pulse'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Scrollable Cards */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-4 px-1 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)'
            }}
          >
            {filteredItems.map((item, index) => {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[140px] sm:w-[160px] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-3"
                >
                  {/* Item Name */}
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                    {isArabic ? item.name : item.nameEn}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg font-black text-emerald-600">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isArabic ? item.unit : item.unitEn}
                    </span>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex items-center gap-1">
                    {getChangeIcon(item.change)}
                    {item.changePercent && (
                      <span className={`text-xs font-bold ${getChangeColor(item.change)}`}>
                        {item.change === 'up' ? '+' : '-'}{item.changePercent}%
                      </span>
                    )}
                    {item.change === 'stable' && (
                      <span className="text-xs text-gray-400">
                        {isArabic ? 'ثابت' : 'Stable'}
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      {isArabic
                        ? categoryFilters.find(f => f.id === item.category)?.name
                        : categoryFilters.find(f => f.id === item.category)?.nameEn}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 text-center mt-2">
          {isArabic ? 'آخر تحديث: اليوم' : 'Last updated: Today'}
        </p>
      </div>
    </section>
  );
}
