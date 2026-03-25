'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const isArabic = language === 'ar';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative overflow-hidden pt-14">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545562083-a600704fa487?auto=format&fit=crop&w=2000&q=80"
          alt="Damascus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/85 via-emerald-800/75 to-emerald-900/90" />
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo & Title - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Zap className="w-7 h-7 text-yellow-300" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                {isArabic ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </h1>
            </div>
            <p className="text-base text-white/90">
              {isArabic ? 'كل خدمات منطقتك في مكان واحد' : 'All your neighborhood services in one place'}
            </p>
          </motion.div>

          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm mb-5"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>{isArabic ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}</span>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xl"
          >
            <div className="bg-white rounded-xl shadow-xl p-1.5 flex items-center gap-2">
              <div className="flex-1 flex items-center px-3 py-2">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن خدمة، محل، طبيب...' : 'Search services, shops, doctors...'}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm px-2"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
