'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Home, 
  Users, 
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  ShoppingCart,
  Fuel,
  Stethoscope,
  Sparkles,
  GraduationCap,
  Trophy,
  Building2,
  Zap,
  Heart,
  Briefcase,
  Package,
  Wrench,
  Calendar,
  X,
  Store,
  Scale,
  Car,
  Banknote,
  Shirt,
  Cake,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegion } from '@/contexts/RegionContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Dynamic imports - Components are loaded only when needed
const RealEstate = dynamic(() => import('./RealEstate'), { loading: () => <LoadingSkeleton /> });
const Jobs = dynamic(() => import('./Jobs'), { loading: () => <LoadingSkeleton /> });
const Restaurants = dynamic(() => import('./Restaurants'), { loading: () => <LoadingSkeleton /> });
const Markets = dynamic(() => import('./Markets'), { loading: () => <LoadingSkeleton /> });
const Doctors = dynamic(() => import('./Doctors'), { loading: () => <LoadingSkeleton /> });
const Pharmacies = dynamic(() => import('./Pharmacies'), { loading: () => <LoadingSkeleton /> });
const Beauty = dynamic(() => import('./Beauty'), { loading: () => <LoadingSkeleton /> });
const GasStations = dynamic(() => import('./GasStations'), { loading: () => <LoadingSkeleton /> });
const CarServices = dynamic(() => import('./CarServices'), { loading: () => <LoadingSkeleton /> });
const Education = dynamic(() => import('./Education'), { loading: () => <LoadingSkeleton /> });
const Sports = dynamic(() => import('./Sports'), { loading: () => <LoadingSkeleton /> });
const Places = dynamic(() => import('./Places'), { loading: () => <LoadingSkeleton /> });
const Hotels = dynamic(() => import('./Hotels'), { loading: () => <LoadingSkeleton /> });
const ServicesStatus = dynamic(() => import('./ServicesStatus'), { loading: () => <LoadingSkeleton /> });
const GovernmentServices = dynamic(() => import('./GovernmentServices'), { loading: () => <LoadingSkeleton /> });
const UsedItems = dynamic(() => import('./UsedItems'), { loading: () => <LoadingSkeleton /> });
const Classifieds = dynamic(() => import('./Classifieds'), { loading: () => <LoadingSkeleton /> });
const Craftsmen = dynamic(() => import('./Craftsmen'), { loading: () => <LoadingSkeleton /> });
const Professionals = dynamic(() => import('./Professionals'), { loading: () => <LoadingSkeleton /> });
const Offices = dynamic(() => import('./Offices'), { loading: () => <LoadingSkeleton /> });
const FinancialServices = dynamic(() => import('./FinancialServices'), { loading: () => <LoadingSkeleton /> });
const Community = dynamic(() => import('./Community'), { loading: () => <LoadingSkeleton /> });
const Charity = dynamic(() => import('./Charity'), { loading: () => <LoadingSkeleton /> });
const Events = dynamic(() => import('./Events'), { loading: () => <LoadingSkeleton /> });
const LaundryServices = dynamic(() => import('./LaundryServices'), { loading: () => <LoadingSkeleton /> });
const Cafes = dynamic(() => import('./Cafes'), { loading: () => <LoadingSkeleton /> });
const RetailShops = dynamic(() => import('./RetailShops'), { loading: () => <LoadingSkeleton /> });
const EventServices = dynamic(() => import('./EventServices'), { loading: () => <LoadingSkeleton /> });
const UrgentServices = dynamic(() => import('./UrgentServices'), { loading: () => <LoadingSkeleton /> });
const EmergencyContacts = dynamic(() => import('./EmergencyContacts'), { loading: () => <LoadingSkeleton /> });
const MedicalCenters = dynamic(() => import('./MedicalCenters'), { loading: () => <LoadingSkeleton /> });

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[260px]">
              <div className="bg-gray-200 rounded-xl aspect-square mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component map for dynamic rendering
const componentMap: Record<string, React.ComponentType> = {
  'urgent-services': UrgentServices,
  'emergency-contacts': EmergencyContacts,
  'restaurants': Restaurants,
  'cafes': Cafes,
  'markets': Markets,
  'retail-shops': RetailShops,
  'gas-stations': GasStations,
  'car-services': CarServices,
  'doctors': Doctors,
  'pharmacies': Pharmacies,
  'medical-centers': MedicalCenters,
  'beauty': Beauty,
  'laundry': LaundryServices,
  'education': Education,
  'sports': Sports,
  'places': Places,
  'hotels': Hotels,
  'services-status': ServicesStatus,
  'government': GovernmentServices,
  'jobs': Jobs,
  'realestate': RealEstate,
  'used': UsedItems,
  'classifieds': Classifieds,
  'craftsmen': Craftsmen,
  'professionals': Professionals,
  'offices': Offices,
  'financial': FinancialServices,
  'community': Community,
  'charity': Charity,
  'events': Events,
  'event-services': EventServices,
};

interface SubService {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface MainService {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  borderColor: string;
  bgLight: string;
  subServices: SubService[];
}

const mainServices: MainService[] = [
  {
    id: 'emergency',
    title: 'طوارئ',
    titleEn: 'Emergency',
    icon: AlertTriangle,
    color: 'text-white',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-600',
    shadowColor: 'shadow-red-200',
    borderColor: 'border-red-300',
    bgLight: 'bg-red-50',
    subServices: [
      { id: 'urgent-services', title: 'خدمات طوارئ', titleEn: 'Emergency Services', subtitle: 'طوارئ وإسعاف', subtitleEn: 'Emergency & Ambulance', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
      { id: 'emergency-contacts', title: 'جهات اتصال', titleEn: 'Contacts', subtitle: 'أرقام هامة', subtitleEn: 'Important Numbers', icon: Building2, color: 'text-gray-600', bgColor: 'bg-gray-100' }
    ]
  },
  {
    id: 'directory',
    title: 'دليل محلي',
    titleEn: 'Directory',
    icon: MapPin,
    color: 'text-white',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    shadowColor: 'shadow-blue-200',
    borderColor: 'border-blue-300',
    bgLight: 'bg-blue-50',
    subServices: [
      { id: 'restaurants', title: 'مطاعم ومقاهي', titleEn: 'Restaurants', subtitle: 'توصيل وجبات', subtitleEn: 'Food Delivery', icon: UtensilsCrossed, color: 'text-orange-600', bgColor: 'bg-orange-100' },
      { id: 'cafes', title: 'مقاهي', titleEn: 'Cafes', subtitle: 'مشروبات', subtitleEn: 'Beverages', icon: UtensilsCrossed, color: 'text-amber-600', bgColor: 'bg-amber-100' },
      { id: 'markets', title: 'أسواق ومتاجر', titleEn: 'Markets', subtitle: 'خضار ولحوم', subtitleEn: 'Vegetables & Meat', icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
      { id: 'retail-shops', title: 'محلات تجارية', titleEn: 'Retail Shops', subtitle: 'ألبسة وخرداوات', subtitleEn: 'Clothes & Hardware', icon: Store, color: 'text-amber-600', bgColor: 'bg-amber-100' },
      { id: 'gas-stations', title: 'بنزين وسيارات', titleEn: 'Gas & Cars', subtitle: 'محطات وقود', subtitleEn: 'Fuel Stations', icon: Fuel, color: 'text-green-600', bgColor: 'bg-green-100' },
      { id: 'car-services', title: 'خدمات السيارات', titleEn: 'Car Services', subtitle: 'مغاسل وورش', subtitleEn: 'Wash & Repair', icon: Car, color: 'text-sky-600', bgColor: 'bg-sky-100' },
      { id: 'doctors', title: 'أطباء', titleEn: 'Doctors', subtitle: 'حجز مواعيد', subtitleEn: 'Appointments', icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-100' },
      { id: 'pharmacies', title: 'صيدليات', titleEn: 'Pharmacies', subtitle: 'أدوية ومناوبات', subtitleEn: 'Medicines', icon: Stethoscope, color: 'text-teal-600', bgColor: 'bg-teal-100' },
      { id: 'medical-centers', title: 'مراكز طبية', titleEn: 'Medical Centers', subtitle: 'مستشفيات', subtitleEn: 'Hospitals', icon: Building2, color: 'text-rose-600', bgColor: 'bg-rose-100' },
      { id: 'beauty', title: 'تجميل وعناية', titleEn: 'Beauty', subtitle: 'صالونات وسبا', subtitleEn: 'Salons & Spa', icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-100' },
      { id: 'laundry', title: 'مغاسل وكي', titleEn: 'Laundry', subtitle: 'غسيل وتنظيف', subtitleEn: 'Wash & Clean', icon: Shirt, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
      { id: 'education', title: 'تعليم ومدارس', titleEn: 'Education', subtitle: 'دروس ودورات', subtitleEn: 'Courses', icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      { id: 'sports', title: 'مراكز رياضية', titleEn: 'Sports', subtitle: 'نوادي وصالات', subtitleEn: 'Clubs & Gyms', icon: Trophy, color: 'text-green-600', bgColor: 'bg-green-100' },
      { id: 'places', title: 'سياحة ومعالم', titleEn: 'Tourism', subtitle: 'معالم وفعاليات', subtitleEn: 'Landmarks', icon: MapPin, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
      { id: 'hotels', title: 'فنادق', titleEn: 'Hotels', subtitle: 'إقامة', subtitleEn: 'Accommodation', icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      { id: 'services-status', title: 'حالة الخدمات', titleEn: 'Services', subtitle: 'كهرباء ومياه', subtitleEn: 'Utilities', icon: Zap, color: 'text-slate-600', bgColor: 'bg-slate-100' },
      { id: 'government', title: 'خدمات حكومية', titleEn: 'Government', subtitle: 'معاملات رسمية', subtitleEn: 'Official Services', icon: Building2, color: 'text-gray-600', bgColor: 'bg-gray-100' }
    ]
  },
  {
    id: 'market',
    title: 'سوق وإعلانات',
    titleEn: 'Market',
    icon: Home,
    color: 'text-white',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-emerald-600',
    shadowColor: 'shadow-teal-200',
    borderColor: 'border-teal-300',
    bgLight: 'bg-teal-50',
    subServices: [
      { id: 'jobs', title: 'وظائف وفرص', titleEn: 'Jobs', subtitle: 'فرص عمل', subtitleEn: 'Job Opportunities', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      { id: 'realestate', title: 'عقارات وإيجارات', titleEn: 'Real Estate', subtitle: 'بيع وإيجار', subtitleEn: 'Sale & Rent', icon: Home, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
      { id: 'used', title: 'مستعمل وإعلانات', titleEn: 'Used Items', subtitle: 'بيع وشراء', subtitleEn: 'Buy & Sell', icon: Package, color: 'text-amber-600', bgColor: 'bg-amber-100' },
      { id: 'classifieds', title: 'إعلانات مبوبة', titleEn: 'Classifieds', subtitle: 'خدمات', subtitleEn: 'Services', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-100' },
      { id: 'craftsmen', title: 'حرفيين ومهنيين', titleEn: 'Craftsmen', subtitle: 'تصليحات', subtitleEn: 'Repairs', icon: Wrench, color: 'text-gray-600', bgColor: 'bg-gray-100' },
      { id: 'professionals', title: 'مهن حرة', titleEn: 'Professionals', subtitle: 'محامين ومهندسين', subtitleEn: 'Lawyers & Engineers', icon: Scale, color: 'text-violet-600', bgColor: 'bg-violet-100' },
      { id: 'offices', title: 'مكاتب ووسطاء', titleEn: 'Offices', subtitle: 'عقارات وسيارات', subtitleEn: 'Real Estate & Cars', icon: Building2, color: 'text-slate-600', bgColor: 'bg-slate-100' },
      { id: 'financial', title: 'خدمات مالية', titleEn: 'Financial', subtitle: 'صرافين وحوالات', subtitleEn: 'Exchange & Transfers', icon: Banknote, color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
    ]
  },
  {
    id: 'community',
    title: 'مجتمع وأخبار',
    titleEn: 'Community',
    icon: Users,
    color: 'text-white',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-600',
    shadowColor: 'shadow-purple-200',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50',
    subServices: [
      { id: 'community', title: 'المجتمع', titleEn: 'Community', subtitle: 'تواصل اجتماعي', subtitleEn: 'Social Connect', icon: Users, color: 'text-rose-600', bgColor: 'bg-rose-100' },
      { id: 'charity', title: 'المؤسسات الخيرية', titleEn: 'Charity', subtitle: 'مساعدة ومشاركة', subtitleEn: 'Help & Share', icon: Heart, color: 'text-teal-600', bgColor: 'bg-teal-100' },
      { id: 'events', title: 'فعاليات وأخبار', titleEn: 'Events & News', subtitle: 'أنشطة وفعاليات', subtitleEn: 'Activities', icon: Calendar, color: 'text-violet-600', bgColor: 'bg-violet-100' },
      { id: 'event-services', title: 'خدمات المناسبات', titleEn: 'Event Services', subtitle: 'حلويات وزهور', subtitleEn: 'Sweets & Flowers', icon: Cake, color: 'text-rose-600', bgColor: 'bg-rose-100' }
    ]
  }
];

export default function QuickServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { regionName } = useRegion();
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<SubService | null>(null);
  const [parentService, setParentService] = useState<MainService | null>(null);

  const activeService = mainServices.find(s => s.id === openSheet);

  const handleSectionClick = (sectionId: string) => {
    setOpenSheet(sectionId);
    setSelectedSection(null);
  };

  const handleSubServiceClick = (subService: SubService, service: MainService) => {
    setSelectedSection(subService);
    setParentService(service);
    setOpenSheet(null);
  };

  const handleCloseSection = () => {
    setSelectedSection(null);
    setParentService(null);
  };

  // Get component dynamically
  const SelectedComponent = selectedSection ? componentMap[selectedSection.id] : null;

  return (
    <>
      {/* Sticky Bar */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? '🚀 الوصول السريع' : '🚀 Quick Access'}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic ? `جميع خدمات ${regionName}` : `All services in ${regionName}`}
              </p>
            </div>
          </div>

          {/* Main Cards - 4 Main Sections */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pb-4">
            {mainServices.map((service) => {
              const Icon = service.icon;
              const isActive = openSheet === service.id;
              const subCount = service.subServices.length;

              return (
                <motion.button
                  key={service.id}
                  onClick={() => handleSectionClick(service.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} shadow-lg ${service.shadowColor}` 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-1.5 sm:p-2.5 rounded-xl mb-1.5 ${
                    isActive 
                      ? 'bg-white/20' 
                      : `bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo}`
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>

                  {/* Title */}
                  <span className={`font-bold text-[10px] sm:text-xs text-center leading-tight ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}>
                    {isArabic ? service.title : service.titleEn}
                  </span>

                  {/* Sub-services count / Arrow */}
                  <div className={`flex items-center gap-0.5 mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] font-medium">{subCount}</span>
                    {isActive ? (
                      <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Section - Appears under the quick access bar */}
      <AnimatePresence mode="wait">
        {selectedSection && parentService && SelectedComponent && (
          <motion.div
            key={selectedSection.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className={`border-t-2 ${parentService.borderColor} ${parentService.bgLight} shadow-lg`}>
              {/* Section Header */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${parentService.gradientFrom} ${parentService.gradientTo} shadow-md`}>
                      <selectedSection.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base sm:text-lg">
                        {isArabic ? selectedSection.title : selectedSection.titleEn}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isArabic ? selectedSection.subtitle : selectedSection.subtitleEn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View All Link */}
                    <Link
                      href={`/${parentService.id}`}
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors shadow-sm border border-gray-200"
                    >
                      <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                    
                    {/* Close Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseSection}
                      className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm border border-gray-200"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Component Content - Loaded dynamically */}
              <div className="bg-white">
                <SelectedComponent />
              </div>

              {/* Mobile View All Button */}
              <div className="sm:hidden max-w-7xl mx-auto px-4 py-3">
                <Link
                  href={`/${parentService.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold transition-colors shadow-sm border border-gray-200"
                >
                  <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet/Drawer from Bottom - For selecting sub-services */}
      <Sheet open={!!openSheet} onOpenChange={(open) => !open && setOpenSheet(null)}>
        <SheetContent 
          side="bottom" 
          className={`h-auto max-h-[70vh] rounded-t-3xl ${activeService?.bgLight || 'bg-white'}`}
        >
          {activeService && (
            <>
              {/* Drag Handle */}
              <div className="flex justify-center -mt-2 mb-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              <SheetHeader className="pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${activeService.gradientFrom} ${activeService.gradientTo} shadow-md`}>
                      <activeService.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <SheetTitle className="text-lg font-black text-gray-900">
                        {isArabic ? activeService.title : activeService.titleEn}
                      </SheetTitle>
                      <p className="text-xs text-gray-500">
                        {activeService.subServices.length} {isArabic ? 'أقسام متاحة' : 'sections available'}
                      </p>
                    </div>
                  </div>
                  
                  {/* View All Link */}
                  <Link
                    href={`/${activeService.id}`}
                    onClick={() => setOpenSheet(null)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors shadow-sm border border-gray-200"
                  >
                    <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </SheetHeader>

              {/* Sub-services Grid */}
              <div className="py-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeService.subServices.map((sub, index) => {
                    const SubIcon = sub.icon;

                    return (
                      <motion.button
                        key={sub.id}
                        onClick={() => handleSubServiceClick(sub, activeService)}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.25, 
                          delay: 0.05 + index * 0.03,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg group cursor-pointer"
                      >
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl ${sub.bgColor} mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                          <SubIcon className={`w-5 h-5 ${sub.color}`} />
                        </div>
                        
                        {/* Title */}
                        <span className="font-bold text-xs text-gray-900 text-center mb-0.5 leading-tight">
                          {isArabic ? sub.title : sub.titleEn}
                        </span>
                        
                        {/* Subtitle */}
                        <span className="text-[10px] text-gray-500 text-center leading-tight">
                          {isArabic ? sub.subtitle : sub.subtitleEn}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
