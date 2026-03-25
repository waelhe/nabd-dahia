'use client';

import React from 'react';
import { Phone, Ambulance, Flame, Shield, AlertTriangle, Car, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface EmergencyContact {
  id: string;
  name: string;
  nameEn: string;
  number: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}

const qudsayaCenterContacts: EmergencyContact[] = [
  {
    id: 'emergency',
    name: 'الطوارئ',
    nameEn: 'Emergency',
    number: '112',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'ambulance',
    name: 'الإسعاف',
    nameEn: 'Ambulance',
    number: '110',
    icon: Ambulance,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    gradient: 'from-rose-500 to-rose-600'
  },
  {
    id: 'fire',
    name: 'الإطفاء',
    nameEn: 'Fire',
    number: '113',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'police',
    name: 'الشرطة',
    nameEn: 'Police',
    number: '011-2234567',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'electricity',
    name: 'الكهرباء',
    nameEn: 'Electricity',
    number: '118',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'traffic',
    name: 'المرور',
    nameEn: 'Traffic',
    number: '115',
    icon: Car,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600'
  }
];

const qudsayaDahiaContacts: EmergencyContact[] = [
  {
    id: 'emergency',
    name: 'الطوارئ',
    nameEn: 'Emergency',
    number: '112',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'ambulance',
    name: 'الإسعاف',
    nameEn: 'Ambulance',
    number: '110',
    icon: Ambulance,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    gradient: 'from-rose-500 to-rose-600'
  },
  {
    id: 'fire',
    name: 'الإطفاء',
    nameEn: 'Fire',
    number: '113',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'police',
    name: 'الشرطة',
    nameEn: 'Police',
    number: '011-2345678',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'electricity',
    name: 'الكهرباء',
    nameEn: 'Electricity',
    number: '011-2356789',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'traffic',
    name: 'المرور',
    nameEn: 'Traffic',
    number: '115',
    icon: Car,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600'
  }
];

const dataByRegion: Record<Region, EmergencyContact[]> = {
  'qudsaya-center': qudsayaCenterContacts,
  'qudsaya-dahia': qudsayaDahiaContacts
};

export default function EmergencyContacts() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region } = useRegion();
  const contacts = dataByRegion[region];

  return (
    <section className="py-2 bg-gradient-to-b from-red-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              {isArabic ? 'أرقام الطوارئ' : 'Emergency Numbers'}
            </h2>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              24/7
            </span>
          </div>
          <RegionSelector />
        </div>

        {/* Grid - Compact */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;

            return (
              <motion.a
                key={contact.id}
                href={`tel:${contact.number}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`group bg-white rounded-xl border ${contact.borderColor} hover:shadow-md transition-all overflow-hidden flex flex-col items-center p-2`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-xl ${contact.bgColor} group-hover:scale-105 transition-transform mb-1`}>
                  <Icon className={`w-5 h-5 ${contact.color}`} />
                </div>

                {/* Name */}
                <h3 className="text-[10px] font-bold text-gray-900 mb-0.5">
                  {isArabic ? contact.name : contact.nameEn}
                </h3>

                {/* Number */}
                <span className="text-xs font-black text-gray-800">
                  {contact.number.length > 7 ? contact.number.slice(0, 7) + '..' : contact.number}
                </span>

                {/* Call indicator */}
                <div className={`mt-1 p-1 rounded-full bg-gradient-to-r ${contact.gradient} group-hover:scale-110 transition-transform`}>
                  <Phone className="w-3 h-3 text-white" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
