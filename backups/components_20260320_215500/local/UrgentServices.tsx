'use client';

import React, { useState } from 'react';
import { 
  Pill, Phone, Clock, MapPin, ChevronDown, ChevronUp, CheckCircle, 
  Stethoscope, Flame, Wrench, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

type ServiceType = 'pharmacies' | 'doctors' | 'emergency' | 'services';

interface Service {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  area: string;
  areaEn: string;
  phone: string;
  hours?: string;
  isOpen: boolean;
  image: string;
  rating?: number;
  specialty?: string;
  specialtyEn?: string;
}

// بيانات ضاحية قدسيا
const qudsayaDahiaServices: Service[] = [
  // الصيدليات
  {
    id: 'p1',
    name: 'صيدلية الشفاء',
    nameEn: 'Al-Shifa Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'ضاحية قدسيا - الحي الرئيسي',
    areaEn: 'Qudsaya Dahia - Main District',
    phone: '0999123456',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'p2',
    name: 'صيدلية النور',
    nameEn: 'Al-Noor Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'ضاحية قدسيا - الشمال',
    areaEn: 'Qudsaya Dahia - North',
    phone: '0998765432',
    hours: '8 ص - 12 ص',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'p3',
    name: 'صيدلية الأمل',
    nameEn: 'Al-Amal Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'ضاحية قدسيا - الجنوب',
    areaEn: 'Qudsaya Dahia - South',
    phone: '0998111222',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80'
  },
  // الأطباء
  {
    id: 'd1',
    name: 'د. أحمد الخالد',
    nameEn: 'Dr. Ahmed Al-Khaled',
    type: 'طبيب',
    typeEn: 'Doctor',
    specialty: 'طبيب عام',
    specialtyEn: 'General Practitioner',
    area: 'ضاحية قدسيا - العيادة المركزية',
    areaEn: 'Qudsaya Dahia - Central Clinic',
    phone: '0999345678',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    rating: 4.9
  },
  {
    id: 'd2',
    name: 'د. فاطمة المحمود',
    nameEn: 'Dr. Fatima Al-Mahmoud',
    type: 'طبيب',
    typeEn: 'Doctor',
    specialty: 'طبيبة أطفال',
    specialtyEn: 'Pediatrician',
    area: 'ضاحية قدسيا',
    areaEn: 'Qudsaya Dahia',
    phone: '0999456789',
    hours: '9 ص - 9 م',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    rating: 4.8
  },
  // الطوارئ
  {
    id: 'e1',
    name: 'الدفاع المدني - ضاحية قدسيا',
    nameEn: 'Civil Defense - Qudsaya Dahia',
    type: 'طوارئ',
    typeEn: 'Emergency',
    area: 'ضاحية قدسيا',
    areaEn: 'Qudsaya Dahia',
    phone: '113',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'e2',
    name: 'مركز الشرطة',
    nameEn: 'Police Station',
    type: 'طوارئ',
    typeEn: 'Emergency',
    area: 'ضاحية قدسيا',
    areaEn: 'Qudsaya Dahia',
    phone: '112',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1557683316-973673bdar?auto=format&fit=crop&w=400&q=80'
  },
  // خدمات
  {
    id: 's1',
    name: 'كهربائي مناوب',
    nameEn: 'On-Duty Electrician',
    type: 'خدمة',
    typeEn: 'Service',
    area: 'ضاحية قدسيا',
    areaEn: 'Qudsaya Dahia',
    phone: '0999789012',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    rating: 4.7
  },
  {
    id: 's2',
    name: 'سباك مناوب',
    nameEn: 'On-Duty Plumber',
    type: 'خدمة',
    typeEn: 'Service',
    area: 'ضاحية قدسيا',
    areaEn: 'Qudsaya Dahia',
    phone: '0999890123',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    rating: 4.6
  }
];

// بيانات قدسيا المركز
const qudsayaCenterServices: Service[] = [
  // الصيدليات
  {
    id: 'cp1',
    name: 'صيدلية القدس',
    nameEn: 'Al-Quds Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'قدسيا المركز - الساحة الرئيسية',
    areaEn: 'Qudsaya Center - Main Square',
    phone: '0999222333',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cp2',
    name: 'صيدلية الشفاء',
    nameEn: 'Al-Shifa Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'قدسيا المركز - الشارع الرئيسي',
    areaEn: 'Qudsaya Center - Main Street',
    phone: '0999333444',
    hours: '8 ص - 10 م',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cp3',
    name: 'صيدلية الرحمة',
    nameEn: 'Al-Rahma Pharmacy',
    type: 'صيدلية',
    typeEn: 'Pharmacy',
    area: 'قدسيا المركز - الحي الغربي',
    areaEn: 'Qudsaya Center - West District',
    phone: '0999444555',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80'
  },
  // الأطباء
  {
    id: 'cd1',
    name: 'د. محمود القدسي',
    nameEn: 'Dr. Mahmoud Al-Qudsi',
    type: 'طبيب',
    typeEn: 'Doctor',
    specialty: 'طبيب عام',
    specialtyEn: 'General Practitioner',
    area: 'قدسيا المركز - العيادة المركزية',
    areaEn: 'Qudsaya Center - Central Clinic',
    phone: '0999555666',
    hours: '8 ص - 8 م',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    rating: 4.8
  },
  {
    id: 'cd2',
    name: 'د. نورة الأحمد',
    nameEn: 'Dr. Noura Al-Ahmad',
    type: 'طبيب',
    typeEn: 'Doctor',
    specialty: 'طبيبة أطفال',
    specialtyEn: 'Pediatrician',
    area: 'قدسيا المركز - الساحة',
    areaEn: 'Qudsaya Center - Square',
    phone: '0999666777',
    hours: '10 ص - 6 م',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    rating: 4.9
  },
  // الطوارئ
  {
    id: 'ce1',
    name: 'الدفاع المدني - قدسيا',
    nameEn: 'Civil Defense - Qudsaya',
    type: 'طوارئ',
    typeEn: 'Emergency',
    area: 'قدسيا المركز',
    areaEn: 'Qudsaya Center',
    phone: '113',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ce2',
    name: 'مخفر شرطة قدسيا',
    nameEn: 'Qudsaya Police Station',
    type: 'طوارئ',
    typeEn: 'Emergency',
    area: 'قدسيا المركز',
    areaEn: 'Qudsaya Center',
    phone: '112',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1557683316-973673bdar?auto=format&fit=crop&w=400&q=80'
  },
  // خدمات
  {
    id: 'cs1',
    name: 'كهربائي مناوب - قدسيا',
    nameEn: 'Electrician - Qudsaya',
    type: 'خدمة',
    typeEn: 'Service',
    area: 'قدسيا المركز',
    areaEn: 'Qudsaya Center',
    phone: '0999888999',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    rating: 4.8
  },
  {
    id: 'cs2',
    name: 'سباك مناوب - قدسيا',
    nameEn: 'Plumber - Qudsaya',
    type: 'خدمة',
    typeEn: 'Service',
    area: 'قدسيا المركز',
    areaEn: 'Qudsaya Center',
    phone: '0999000111',
    hours: '24 ساعة',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    rating: 4.5
  }
];

const allServicesByRegion: Record<Region, Service[]> = {
  'qudsaya-center': qudsayaCenterServices,
  'qudsaya-dahia': qudsayaDahiaServices
};

const categories = [
  { id: 'pharmacies' as ServiceType, name: 'صيدليات', nameEn: 'Pharmacies', icon: Pill, color: 'emerald' },
  { id: 'doctors' as ServiceType, name: 'أطباء', nameEn: 'Doctors', icon: Stethoscope, color: 'blue' },
  { id: 'emergency' as ServiceType, name: 'طوارئ', nameEn: 'Emergency', icon: Flame, color: 'red' },
  { id: 'services' as ServiceType, name: 'خدمات مناوبة', nameEn: 'On-Duty Services', icon: Wrench, color: 'slate' }
];

const colorMap: Record<string, { bg: string; light: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-600', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  red: { bg: 'bg-red-600', light: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  slate: { bg: 'bg-slate-600', light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
};

export default function UrgentServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region } = useRegion();
  const [activeCategory, setActiveCategory] = useState<ServiceType>('pharmacies');
  const [showAll, setShowAll] = useState(false);

  const allServices = allServicesByRegion[region];

  const filteredServices = allServices.filter(s => {
    if (activeCategory === 'pharmacies') return s.type === 'صيدلية';
    if (activeCategory === 'doctors') return s.type === 'طبيب';
    if (activeCategory === 'emergency') return s.type === 'طوارئ';
    if (activeCategory === 'services') return s.type === 'خدمة';
    return true;
  });

  const displayedServices = showAll ? filteredServices : filteredServices.slice(0, 4);
  const activeCat = categories.find(c => c.id === activeCategory)!;
  const colors = colorMap[activeCat.color];

  return (
    <section className="py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Region Selector */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${colors.bg} rounded-2xl shadow-lg`}>
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'خدمات مناوبة' : 'On-Duty Services'}
              </h2>
              <p className="text-sm text-gray-500">
                {isArabic ? 'متوفرة الآن' : 'Available now'}
              </p>
            </div>
          </div>
          
          {/* Region Selector */}
          <RegionSelector />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const catColors = colorMap[cat.color];
            const isActive = activeCategory === cat.id;
            const count = allServices.filter(s => {
              if (cat.id === 'pharmacies') return s.type === 'صيدلية';
              if (cat.id === 'doctors') return s.type === 'طبيب';
              if (cat.id === 'emergency') return s.type === 'طوارئ';
              if (cat.id === 'services') return s.type === 'خدمة';
              return true;
            }).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowAll(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive 
                    ? `${catColors.bg} text-white shadow-lg` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-bold">{isArabic ? cat.name : cat.nameEn}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/30' : catColors.light + ' ' + catColors.text
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedServices.map((service, index) => (
              <motion.a
                key={service.id}
                href={`tel:${service.phone}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-white rounded-2xl border-2 ${colors.border} hover:shadow-xl transition-all overflow-hidden`}
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={service.image}
                      alt={isArabic ? service.name : service.nameEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center">
                      <span className={`px-2 py-0.5 ${colors.bg} text-white text-[10px] font-bold rounded-full`}>
                        {isArabic ? service.type : service.typeEn}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {isArabic ? service.name : service.nameEn}
                        </h3>
                        {service.specialty && (
                          <span className={`text-xs px-2 py-0.5 ${colors.light} ${colors.text} rounded-full`}>
                            {isArabic ? service.specialty : service.specialtyEn}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{isArabic ? service.area : service.areaEn}</span>
                        </div>
                        {service.hours && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.hours}</span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 ${colors.light} rounded-xl group-hover:${colors.bg} transition-colors`}>
                        <Phone className={`w-5 h-5 ${colors.text} group-hover:text-white transition-colors`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${colors.text}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {service.phone}
                        </span>
                      </div>
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-gray-900">{service.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {filteredServices.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`w-full mt-4 flex items-center justify-center gap-2 ${colors.text} text-base font-bold py-3 ${colors.light} hover:opacity-80 rounded-xl transition-colors`}
          >
            {showAll 
              ? (isArabic ? 'عرض أقل' : 'Show Less')
              : (isArabic ? `عرض الكل (${filteredServices.length})` : `Show All (${filteredServices.length})`)
            }
            {showAll 
              ? <ChevronUp className="w-5 h-5" />
              : <ChevronDown className="w-5 h-5" />
            }
          </button>
        )}
      </div>
    </section>
  );
}
