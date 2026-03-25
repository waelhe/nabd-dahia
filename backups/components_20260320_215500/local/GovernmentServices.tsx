'use client';

import React from 'react';
import { Building2, FileText, Car, Home, Users, CreditCard, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface GovService {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  description: string;
  descriptionEn: string;
  time: string;
}

const qudsayaCenterServices: GovService[] = [
  {
    id: '1',
    name: 'الأحوال المدنية - قدسيا',
    nameEn: 'Civil Registry - Qudsaya',
    icon: Users,
    color: 'bg-blue-600',
    description: 'إخراج قيد، هوية، جواز',
    descriptionEn: 'ID, Passport, Records',
    time: '8:00 - 14:00'
  },
  {
    id: '2',
    name: 'مديرية المرور - قدسيا',
    nameEn: 'Traffic Dept - Qudsaya',
    icon: Car,
    color: 'bg-amber-600',
    description: 'رخص قيادة، مخالفات',
    descriptionEn: 'Licenses, Violations',
    time: '8:00 - 14:00'
  },
  {
    id: '3',
    name: 'بلدية قدسيا',
    nameEn: 'Qudsaya Municipality',
    icon: Building2,
    color: 'bg-emerald-600',
    description: 'رخص بناء، عقود',
    descriptionEn: 'Building Permits, Contracts',
    time: '8:00 - 15:00'
  },
  {
    id: '4',
    name: 'السجل العقاري - قدسيا',
    nameEn: 'Real Estate Registry - Qudsaya',
    icon: Home,
    color: 'bg-purple-600',
    description: 'بيع، شراء، فراغ',
    descriptionEn: 'Sale, Purchase, Transfer',
    time: '8:00 - 14:00'
  },
  {
    id: '5',
    name: 'الضرائب والرسوم',
    nameEn: 'Taxes & Fees',
    icon: CreditCard,
    color: 'bg-red-600',
    description: 'دفع الضرائب والرسوم',
    descriptionEn: 'Pay Taxes & Fees',
    time: '8:00 - 14:00'
  },
  {
    id: '6',
    name: 'نماذج وطلبات',
    nameEn: 'Forms & Applications',
    icon: FileText,
    color: 'bg-teal-600',
    description: 'تحميل النماذج الرسمية',
    descriptionEn: 'Download Official Forms',
    time: 'أونلاين'
  }
];

const qudsayaDahiaServices: GovService[] = [
  {
    id: '1',
    name: 'الأحوال المدنية - الضاحية',
    nameEn: 'Civil Registry - Dahia',
    icon: Users,
    color: 'bg-blue-600',
    description: 'إخراج قيد، هوية، جواز',
    descriptionEn: 'ID, Passport, Records',
    time: '8:00 - 14:00'
  },
  {
    id: '2',
    name: 'مديرية المرور - الضاحية',
    nameEn: 'Traffic Dept - Dahia',
    icon: Car,
    color: 'bg-amber-600',
    description: 'رخص قيادة، مخالفات',
    descriptionEn: 'Licenses, Violations',
    time: '8:00 - 14:00'
  },
  {
    id: '3',
    name: 'بلدية الضاحية',
    nameEn: 'Dahia Municipality',
    icon: Building2,
    color: 'bg-emerald-600',
    description: 'رخص بناء، عقود',
    descriptionEn: 'Building Permits, Contracts',
    time: '8:00 - 15:00'
  },
  {
    id: '4',
    name: 'السجل العقاري - الضاحية',
    nameEn: 'Real Estate Registry - Dahia',
    icon: Home,
    color: 'bg-purple-600',
    description: 'بيع، شراء، فراغ',
    descriptionEn: 'Sale, Purchase, Transfer',
    time: '8:00 - 14:00'
  },
  {
    id: '5',
    name: 'الضرائب والرسوم',
    nameEn: 'Taxes & Fees',
    icon: CreditCard,
    color: 'bg-red-600',
    description: 'دفع الضرائب والرسوم',
    descriptionEn: 'Pay Taxes & Fees',
    time: '8:00 - 14:00'
  },
  {
    id: '6',
    name: 'نماذج وطلبات',
    nameEn: 'Forms & Applications',
    icon: FileText,
    color: 'bg-teal-600',
    description: 'تحميل النماذج الرسمية',
    descriptionEn: 'Download Official Forms',
    time: 'أونلاين'
  }
];

const dataByRegion: Record<Region, GovService[]> = {
  'qudsaya-center': qudsayaCenterServices,
  'qudsaya-dahia': qudsayaDahiaServices
};

export default function GovernmentServices() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const services = dataByRegion[region];

  return (
    <section className="py-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-700 rounded-2xl shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'الخدمات الحكومية' : 'Government Services'}
              </h2>
              <p className="text-sm text-gray-500">
                {isArabic ? `الدوائر الرسمية في ${regionName}` : `Official departments in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl border border-gray-200 hover:shadow-xl overflow-hidden cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 ${service.color} rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {isArabic ? service.name : service.nameEn}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {isArabic ? service.description : service.descriptionEn}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{service.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
