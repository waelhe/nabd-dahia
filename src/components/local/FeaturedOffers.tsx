'use client';

import React from 'react';
import { Tag, Clock, Flame, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion, Region } from '@/contexts/RegionContext';

interface Offer {
  id: string;
  title: string;
  titleEn: string;
  store: string;
  storeEn: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  endTime: string;
  image: string;
  badge?: string;
  badgeEn?: string;
}

const qudsayaCenterOffers: Offer[] = [
  {
    id: '1',
    title: 'عرض خاص على المنتجات الغذائية',
    titleEn: 'Special Food Offer',
    store: 'سوبر ماركت قدسيا',
    storeEn: 'Qudsaya Supermarket',
    discount: '30%',
    oldPrice: '50,000',
    newPrice: '35,000',
    endTime: 'ينتهي غداً',
    badge: 'محدود',
    badgeEn: 'Limited',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'خصم على الملابس الشتوية',
    titleEn: 'Winter Clothes Sale',
    store: 'محل الأناقة',
    storeEn: 'Elegance Store',
    discount: '50%',
    oldPrice: '120,000',
    newPrice: '60,000',
    endTime: '3 أيام متبقية',
    badge: 'حصري',
    badgeEn: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'عروض الأجهزة الكهربائية',
    titleEn: 'Electronics Deals',
    store: 'إلكترون قدسيا',
    storeEn: 'Qudsaya Electronics',
    discount: '25%',
    oldPrice: '200,000',
    newPrice: '150,000',
    endTime: '5 أيام متبقية',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80'
  }
];

const qudsayaDahiaOffers: Offer[] = [
  {
    id: '1',
    title: 'عرض خاص على المنتجات الغذائية',
    titleEn: 'Special Food Offer',
    store: 'سوبر ماركت الضاحية',
    storeEn: 'Dahia Supermarket',
    discount: '25%',
    oldPrice: '55,000',
    newPrice: '40,000',
    endTime: 'ينتهي بعد غد',
    badge: 'جديد',
    badgeEn: 'New',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'خصم على الأجهزة الكهربائية',
    titleEn: 'Electronics Discount',
    store: 'محل الإلكترونيات',
    storeEn: 'Electronics Store',
    discount: '40%',
    oldPrice: '140,000',
    newPrice: '85,000',
    endTime: '5 أيام متبقية',
    badge: 'حصري',
    badgeEn: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'عروض المطاعم',
    titleEn: 'Restaurant Offers',
    store: 'مطعم الليمون',
    storeEn: 'Lemon Restaurant',
    discount: '20%',
    oldPrice: '30,000',
    newPrice: '24,000',
    endTime: 'أسبوع متبقي',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80'
  }
];

const dataByRegion: Record<Region, Offer[]> = {
  'qudsaya-center': qudsayaCenterOffers,
  'qudsaya-dahia': qudsayaDahiaOffers
};

export default function FeaturedOffers() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const offers = dataByRegion[region];

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 relative overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 md:w-60 md:h-60 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-yellow-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2.5 md:p-3 lg:p-4 bg-white rounded-xl md:rounded-2xl shadow-lg"
            >
              <Flame className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-rose-500" />
            </motion.div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                {isArabic ? '🔥 عروض حصرية' : '🔥 Exclusive Offers'}
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/20 rounded-full text-xs md:text-sm">
                  {offers.length} {isArabic ? 'عروض' : 'offers'}
                </span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-white/80">
                {isArabic ? `أفضل العروض في ${regionName}` : `Best offers in ${regionName}`}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <button
              onClick={() => scroll('right')}
              className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Offers Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-72 md:w-80 lg:w-96 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-36 md:h-44 lg:h-52 overflow-hidden">
                <img
                  src={offer.image}
                  alt={isArabic ? offer.title : offer.titleEn}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 md:top-3 md:right-3 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm md:text-base font-black rounded-full shadow-lg flex items-center gap-1 md:gap-2">
                  <Tag className="w-4 h-4 md:w-5 md:h-5" />
                  {offer.discount} OFF
                </div>

                {/* Exclusive Badge */}
                {offer.badge && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    {isArabic ? offer.badge : offer.badgeEn}
                  </div>
                )}

                {/* End Time */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1 text-xs font-medium text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {offer.endTime}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 lg:p-6">
                <h3 className="font-bold text-gray-900 text-base md:text-lg lg:text-xl mb-1 md:mb-2 line-clamp-1">
                  {isArabic ? offer.title : offer.titleEn}
                </h3>
                <p className="text-sm md:text-base text-gray-500 flex items-center gap-1 mb-3 md:mb-4">
                  <Store className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {isArabic ? offer.store : offer.storeEn}
                </p>

                {/* Price */}
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xl md:text-2xl lg:text-3xl font-black text-rose-600">
                    {offer.newPrice}
                    <span className="text-xs md:text-sm font-normal text-gray-500 mr-1">{isArabic ? 'ل.س' : 'S.P.'}</span>
                  </span>
                  <span className="text-sm md:text-base text-gray-400 line-through">
                    {offer.oldPrice}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
