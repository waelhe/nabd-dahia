'use client';

import React from 'react';
import { Zap, Droplets, Wifi, Fuel, CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

interface ServiceStatus {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  status: 'active' | 'inactive' | 'partial' | 'maintenance';
  lastUpdate: string;
  lastUpdateEn: string;
  message: string;
  messageEn: string;
  color: string;
}

const qudsayaCenterServices: ServiceStatus[] = [
  {
    id: 'electricity',
    name: 'الكهرباء',
    nameEn: 'Electricity',
    icon: Zap,
    status: 'partial',
    lastUpdate: 'منذ 5 دقائق',
    lastUpdateEn: '5 min ago',
    message: 'مقطوع جزئياً - حي المركز',
    messageEn: 'Partial outage - Center district',
    color: 'yellow'
  },
  {
    id: 'water',
    name: 'الماء',
    nameEn: 'Water',
    icon: Droplets,
    status: 'active',
    lastUpdate: 'منذ 10 دقائق',
    lastUpdateEn: '10 min ago',
    message: 'متوفر في جميع الأحياء',
    messageEn: 'Available in all areas',
    color: 'blue'
  },
  {
    id: 'internet',
    name: 'الإنترنت',
    nameEn: 'Internet',
    icon: Wifi,
    status: 'active',
    lastUpdate: 'منذ 2 دقيقة',
    lastUpdateEn: '2 min ago',
    message: 'الاتصال مستقر',
    messageEn: 'Connection stable',
    color: 'purple'
  },
  {
    id: 'fuel',
    name: 'الوقود',
    nameEn: 'Fuel',
    icon: Fuel,
    status: 'partial',
    lastUpdate: 'منذ 15 دقيقة',
    lastUpdateEn: '15 min ago',
    message: 'المازوت متوفر - البنزين محدود',
    messageEn: 'Diesel available - Gas limited',
    color: 'orange'
  }
];

const qudsayaDahiaServices: ServiceStatus[] = [
  {
    id: 'electricity',
    name: 'الكهرباء',
    nameEn: 'Electricity',
    icon: Zap,
    status: 'active',
    lastUpdate: 'منذ 3 دقائق',
    lastUpdateEn: '3 min ago',
    message: 'متوفر في جميع أنحاء الضاحية',
    messageEn: 'Available throughout Dahia',
    color: 'yellow'
  },
  {
    id: 'water',
    name: 'الماء',
    nameEn: 'Water',
    icon: Droplets,
    status: 'partial',
    lastUpdate: 'منذ 8 دقائق',
    lastUpdateEn: '8 min ago',
    message: 'انخفاض الضغط في الحي الشرقي',
    messageEn: 'Low pressure in East district',
    color: 'blue'
  },
  {
    id: 'internet',
    name: 'الإنترنت',
    nameEn: 'Internet',
    icon: Wifi,
    status: 'active',
    lastUpdate: 'منذ 1 دقيقة',
    lastUpdateEn: '1 min ago',
    message: 'الاتصال ممتاز',
    messageEn: 'Excellent connection',
    color: 'purple'
  },
  {
    id: 'fuel',
    name: 'الوقود',
    nameEn: 'Fuel',
    icon: Fuel,
    status: 'active',
    lastUpdate: 'منذ 20 دقيقة',
    lastUpdateEn: '20 min ago',
    message: 'متوفر بكثرة - جميع المحطات',
    messageEn: 'Available - All stations',
    color: 'orange'
  }
];

const dataByRegion: Record<Region, ServiceStatus[]> = {
  'qudsaya-center': qudsayaCenterServices,
  'qudsaya-dahia': qudsayaDahiaServices
};

const getStatusConfig = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'active':
      return {
        icon: CheckCircle,
        text: 'متوفر',
        textEn: 'Available',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        gradientClass: 'from-emerald-500 to-emerald-600'
      };
    case 'inactive':
      return {
        icon: XCircle,
        text: 'مقطوع',
        textEn: 'Outage',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        gradientClass: 'from-red-500 to-red-600'
      };
    case 'partial':
      return {
        icon: AlertTriangle,
        text: 'جزئي',
        textEn: 'Partial',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        gradientClass: 'from-amber-500 to-amber-600'
      };
    case 'maintenance':
      return {
        icon: Clock,
        text: 'صيانة',
        textEn: 'Maintenance',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        gradientClass: 'from-blue-500 to-blue-600'
      };
  }
};

export default function ServicesStatus() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const services = dataByRegion[region];

  return (
    <section className="py-5 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <RefreshCw className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'حالة الخدمات' : 'Services Status'}
              </h2>
              <p className="text-sm text-gray-500">
                {isArabic ? `تحديث مباشر لحالة الخدمات - ${regionName}` : `Live services status updates - ${regionName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500 font-medium">Live</span>
            </div>
            <RegionSelector />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;
            const ServiceIcon = service.icon;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl border-2 ${statusConfig.borderClass} shadow-sm hover:shadow-lg transition-all overflow-hidden`}
              >
                {/* Gradient Top */}
                <div className={`h-2 bg-gradient-to-r ${statusConfig.gradientClass}`} />
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl ${statusConfig.bgClass}`}>
                      <ServiceIcon className={`w-7 h-7 ${statusConfig.colorClass}`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bgClass}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.colorClass}`} />
                      <span className={`text-xs font-bold ${statusConfig.colorClass}`}>
                        {isArabic ? statusConfig.text : statusConfig.textEn}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {isArabic ? service.name : service.nameEn}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {isArabic ? service.message : service.messageEn}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {isArabic ? service.lastUpdate : service.lastUpdateEn}
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
