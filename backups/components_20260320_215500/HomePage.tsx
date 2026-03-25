/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Home Page Component - Optimized with Dynamic Imports
 * نبض الضاحية وقدسيا - الصفحة الرئيسية
 */

'use client';

import { 
  Phone, AlertTriangle, BookOpen, Home, ShoppingBag, Heart, Users, Calendar, MapPin, Zap, Briefcase, Trophy, Building2, Sparkles, Fuel, ChevronDown, ChevronUp, Store, Scale, Car, Banknote, Shirt, Cake
} from 'lucide-react';
import { Hero } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from '@/components/local/RegionSelector';
import dynamic from 'next/dynamic';

// Always loaded components (visible by default)
import { 
  QuickServices, FeaturedOffers, DailyInfoBar,
  UrgentServices, EmergencyContacts,
  Restaurants, Cafes, Markets, MarketPrices, RetailShops,
  GasStations, CarServices,
  Doctors, Pharmacies, MedicalCenters,
  Jobs, RealEstate, Professionals,
  Community, Charity
} from '@/components/local';

// Rename for clarity in this file
const RealEstateComponent = RealEstate;
const ProfessionalsComponent = Professionals;

// Dynamic loaded components (only when "Show More" is clicked)
const Beauty = dynamic(() => import('@/components/local/Beauty'), { loading: () => <SectionSkeleton /> });
const LaundryServices = dynamic(() => import('@/components/local/LaundryServices'), { loading: () => <SectionSkeleton /> });
const Education = dynamic(() => import('@/components/local/Education'), { loading: () => <SectionSkeleton /> });
const Sports = dynamic(() => import('@/components/local/Sports'), { loading: () => <SectionSkeleton /> });
const Places = dynamic(() => import('@/components/local/Places'), { loading: () => <SectionSkeleton /> });
const Hotels = dynamic(() => import('@/components/local/Hotels'), { loading: () => <SectionSkeleton /> });
const EventServices = dynamic(() => import('@/components/local/EventServices'), { loading: () => <SectionSkeleton /> });
const ServicesStatus = dynamic(() => import('@/components/local/ServicesStatus'), { loading: () => <SectionSkeleton /> });
const GovernmentServices = dynamic(() => import('@/components/local/GovernmentServices'), { loading: () => <SectionSkeleton /> });
const UsedItems = dynamic(() => import('@/components/local/UsedItems'), { loading: () => <SectionSkeleton /> });
const Classifieds = dynamic(() => import('@/components/local/Classifieds'), { loading: () => <SectionSkeleton /> });
const Craftsmen = dynamic(() => import('@/components/local/Craftsmen'), { loading: () => <SectionSkeleton /> });
const Offices = dynamic(() => import('@/components/local/Offices'), { loading: () => <SectionSkeleton /> });
const FinancialServices = dynamic(() => import('@/components/local/FinancialServices'), { loading: () => <SectionSkeleton /> });
const Events = dynamic(() => import('@/components/local/Events'), { loading: () => <SectionSkeleton /> });
const LocalNews = dynamic(() => import('@/components/local/LocalNews'), { loading: () => <SectionSkeleton /> });

import { useState } from 'react';
import Link from 'next/link';

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <div className="py-4 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[240px]">
              <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [showMoreLocal, setShowMoreLocal] = useState(false);
  const [showMoreMarket, setShowMoreMarket] = useState(false);
  const [showMoreCommunity, setShowMoreCommunity] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 🌟 Hero Section */}
      <Hero />

      {/* 🎯 Quick Access Bar */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <RegionSelector variant="compact" className="sm:min-w-[140px]" />
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              <a 
                href="tel:112" 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isArabic ? 'طوارئ' : 'Emergency'}</span>
              </a>
              <a 
                href="tel:110" 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إسعاف' : 'Ambulance'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 🕌☀️ Daily Info Bar - Prayer Times & Weather */}
      <DailyInfoBar />

      {/* 🔥 Featured Offers */}
      <FeaturedOffers />

      {/* ⚡ Quick Services */}
      <QuickServices />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 📞 الجزء الأول: دليل الطوارئ والمناوبات                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-8 mb-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Part Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-200">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {isArabic ? '📞 دليل الطوارئ والمناوبات' : '📞 Emergency & On-Duty Guide'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isArabic ? 'خدمات متاحة على مدار الساعة' : 'Available 24/7 services'}
                </p>
              </div>
            </div>
            <Link href="/emergency" className="flex items-center gap-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm font-bold transition-colors">
              <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>

          {/* Sections */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 overflow-hidden shadow-sm">
            <div id="emergency"><UrgentServices /></div>
            <div className="border-t border-gray-100"><EmergencyContacts /></div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 📱 الجزء الثاني: الدليل المحلي                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-6 bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Part Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {isArabic ? '📱 الدليل المحلي' : '📱 Local Directory'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isArabic ? 'كل ما تحتاجه في منطقتك' : 'Everything you need in your area'}
                </p>
              </div>
            </div>
            <Link href="/directory" className="flex items-center gap-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl text-sm font-bold transition-colors">
              <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>

          {/* Sections Grid */}
          <div className="space-y-4">
            {/* Food & Cafes */}
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-orange-100 to-transparent">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-orange-600">
                  {isArabic ? '🍽️ مطاعم ومقاهي' : '🍽️ Restaurants & Cafes'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="restaurants"><Restaurants /></div>
                <div className="border-t border-gray-100" id="cafes"><Cafes /></div>
              </div>
            </div>

            {/* Markets */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-emerald-100 to-transparent">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-emerald-600">
                  {isArabic ? '🛒 أسواق ومتاجر' : '🛒 Markets & Stores'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="markets"><Markets /></div>
                <div className="border-t border-gray-100" id="market-prices"><MarketPrices /></div>
                <div className="border-t border-gray-100" id="retail-shops"><RetailShops /></div>
              </div>
            </div>

            {/* Gas Stations & Car Services */}
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-green-100 to-transparent">
                <Car className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-black text-green-600">
                  {isArabic ? '⛽ بنزين وخدمات سيارات' : '⛽ Gas & Car Services'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="gas-stations"><GasStations /></div>
                <div className="border-t border-gray-100" id="car-services"><CarServices /></div>
              </div>
            </div>

            {/* Doctors, Pharmacies & Medical Centers */}
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-rose-100 to-transparent">
                <Building2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-rose-600">
                  {isArabic ? '🏥 أطباء وصيدليات ومراكز طبية' : '🏥 Doctors, Pharmacies & Medical Centers'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="doctors"><Doctors /></div>
                <div className="border-t border-gray-100" id="pharmacies"><Pharmacies /></div>
                <div className="border-t border-gray-100" id="medical-centers"><MedicalCenters /></div>
              </div>
            </div>

            {/* Show More Button */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowMoreLocal(!showMoreLocal)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-600 font-bold text-sm shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
                >
                  {showMoreLocal ? (
                    <>
                      <span>{isArabic ? 'عرض أقل' : 'Show Less'}</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{isArabic ? `عرض المزيد` : 'Show More'}</span>
                      <span className="text-xs text-blue-400 font-normal">({isArabic ? '8 أقسام' : '8 sections'})</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden Sections - Show More - Loaded Dynamically */}
            {showMoreLocal && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Beauty & Care */}
                <div className="rounded-2xl border-2 border-pink-200 bg-pink-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-pink-100 to-transparent">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    <h3 className="text-base font-black text-pink-600">
                      {isArabic ? '✨ تجميل وعناية' : '✨ Beauty & Care'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="beauty"><Beauty /></div>
                  </div>
                </div>

                {/* Laundry Services */}
                <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-cyan-100 to-transparent">
                    <Shirt className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-base font-black text-cyan-600">
                      {isArabic ? '🧺 خدمات الغسيل والتنظيف' : '🧺 Laundry Services'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="laundry"><LaundryServices /></div>
                  </div>
                </div>

                {/* Education */}
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-indigo-100 to-transparent">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-black text-indigo-600">
                      {isArabic ? '📚 تعليم ومدارس' : '📚 Education'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="education"><Education /></div>
                  </div>
                </div>

                {/* Sports Centers */}
                <div className="rounded-2xl border-2 border-green-200 bg-green-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-green-100 to-transparent">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <h3 className="text-base font-black text-green-600">
                      {isArabic ? '🏆 مراكز رياضية' : '🏆 Sports Centers'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="sports"><Sports /></div>
                  </div>
                </div>

                {/* Landmarks & Hotels */}
                <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-cyan-100 to-transparent">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-base font-black text-cyan-600">
                      {isArabic ? '📍 سياحة وفنادق' : '📍 Tourism & Hotels'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="places"><Places /></div>
                    <div className="border-t border-gray-100" id="hotels"><Hotels /></div>
                  </div>
                </div>

                {/* Event Services */}
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-rose-100 to-transparent">
                    <Cake className="w-5 h-5 text-rose-600" />
                    <h3 className="text-base font-black text-rose-600">
                      {isArabic ? '🎉 خدمات المناسبات' : '🎉 Event Services'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="event-services"><EventServices /></div>
                  </div>
                </div>

                {/* Services Status */}
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-slate-100 to-transparent">
                    <Zap className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-black text-slate-600">
                      {isArabic ? '⚡ حالة الخدمات' : '⚡ Services Status'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="services-status"><ServicesStatus /></div>
                  </div>
                </div>

                {/* Government Services */}
                <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-gray-100 to-transparent">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-black text-gray-600">
                      {isArabic ? '🏛️ خدمات حكومية' : '🏛️ Government Services'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="government"><GovernmentServices /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 🏠 الجزء الثالث: السوق والإعلانات                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-6 bg-gradient-to-b from-teal-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Part Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b-4 border-teal-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-200">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {isArabic ? '🏠 السوق والإعلانات' : '🏠 Market & Classifieds'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isArabic ? 'عقارات، مستعمل، وظائف وإعلانات' : 'Real estate, used items, jobs & ads'}
                </p>
              </div>
            </div>
            <Link href="/market" className="flex items-center gap-1 px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-xl text-sm font-bold transition-colors">
              <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>

          {/* Sections Grid */}
          <div className="space-y-4">
            {/* Jobs - Featured */}
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-blue-100 to-transparent">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-blue-600">
                  {isArabic ? '💼 وظائف وفرص عمل' : '💼 Jobs & Opportunities'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="jobs"><Jobs /></div>
              </div>
            </div>

            {/* Real Estate */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-emerald-100 to-transparent">
                <Home className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-emerald-600">
                  {isArabic ? '🏡 عقارات وإيجارات' : '🏡 Real Estate'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="realestate"><RealEstateComponent /></div>
              </div>
            </div>

            {/* Professionals */}
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-violet-100 to-transparent">
                <Scale className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-black text-violet-600">
                  {isArabic ? '👔 المهن الحرة المتخصصة' : '👔 Professionals'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="professionals"><ProfessionalsComponent /></div>
              </div>
            </div>

            {/* Show More Button */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowMoreMarket(!showMoreMarket)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl text-teal-600 font-bold text-sm shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300"
                >
                  {showMoreMarket ? (
                    <>
                      <span>{isArabic ? 'عرض أقل' : 'Show Less'}</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{isArabic ? `عرض المزيد` : 'Show More'}</span>
                      <span className="text-xs text-teal-400 font-normal">({isArabic ? '5 أقسام' : '5 sections'})</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden Sections - Show More - Loaded Dynamically */}
            {showMoreMarket && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Used & Classifieds */}
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-amber-100 to-transparent">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-black text-amber-600">
                      {isArabic ? '📦 مستعمل وإعلانات' : '📦 Used & Classifieds'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="used"><UsedItems /></div>
                    <div className="border-t border-gray-100" id="classifieds"><Classifieds /></div>
                  </div>
                </div>

                {/* Craftsmen */}
                <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-gray-100 to-transparent">
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-black text-gray-600">
                      {isArabic ? '🔧 حرفيين ومهنيين' : '🔧 Craftsmen'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="craftsmen"><Craftsmen /></div>
                  </div>
                </div>

                {/* Offices */}
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-slate-100 to-transparent">
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-black text-slate-600">
                      {isArabic ? '🏢 مكاتب ووسطاء' : '🏢 Offices & Agents'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="offices"><Offices /></div>
                  </div>
                </div>

                {/* Financial Services */}
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-emerald-100 to-transparent">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-black text-emerald-600">
                      {isArabic ? '💰 خدمات مالية' : '💰 Financial Services'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="financial"><FinancialServices /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 👥 الجزء الرابع: المجتمع والأخبار                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-8 bg-gradient-to-b from-purple-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Part Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg shadow-purple-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {isArabic ? '👥 المجتمع والأخبار' : '👥 Community & News'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isArabic ? 'تواصل وشارك مع مجتمعك' : 'Connect and share with your community'}
                </p>
              </div>
            </div>
            <Link href="/community" className="flex items-center gap-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-xl text-sm font-bold transition-colors">
              <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>

          {/* Sections Grid */}
          <div className="space-y-4">
            {/* Community */}
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-rose-100 to-transparent">
                <Users className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-rose-600">
                  {isArabic ? '💬 المجتمع' : '💬 Community'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="community"><Community /></div>
              </div>
            </div>

            {/* Charity */}
            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-teal-100 to-transparent">
                <Heart className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-teal-600">
                  {isArabic ? '💝 المؤسسات الخيرية' : '💝 Charity Organizations'}
                </h3>
              </div>
              <div className="bg-white border-t border-gray-100">
                <div id="charity"><Charity /></div>
              </div>
            </div>

            {/* Show More Button */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowMoreCommunity(!showMoreCommunity)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl text-purple-600 font-bold text-sm shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300"
                >
                  {showMoreCommunity ? (
                    <>
                      <span>{isArabic ? 'عرض أقل' : 'Show Less'}</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{isArabic ? `عرض المزيد` : 'Show More'}</span>
                      <span className="text-xs text-purple-400 font-normal">({isArabic ? 'قسم واحد' : '1 section'})</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden Sections - Show More - Loaded Dynamically */}
            {showMoreCommunity && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Events & News */}
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-gradient-to-l from-violet-100 to-transparent">
                    <Calendar className="w-5 h-5 text-violet-600" />
                    <h3 className="text-base font-black text-violet-600">
                      {isArabic ? '📅 فعاليات وأخبار' : '📅 Events & News'}
                    </h3>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    <div id="events"><Events /></div>
                    <div className="border-t border-gray-100" id="news"><LocalNews /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
