'use client';

import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { useRegion, Region } from '@/contexts/RegionContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegionSelectorProps {
  className?: string;
  variant?: 'default' | 'light' | 'compact' | 'mini';
}

export default function RegionSelector({ className = '', variant = 'default' }: RegionSelectorProps) {
  const { region, setRegion } = useRegion();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const regions: { id: Region; name: string; nameEn: string; icon: string }[] = [
    { id: 'qudsaya-center', name: 'قدسيا', nameEn: 'Qudsaya', icon: '🏙️' },
    { id: 'qudsaya-dahia', name: 'ضاحية قدسيا', nameEn: 'Dahia', icon: '🌳' }
  ];

  // Mini variant - صغير جداً للاستخدام داخل الأقسام (فوق بعض)
  // يعمل على الخلفية البيضاء والملونة
  if (variant === 'mini') {
    return (
      <div className={`inline-flex flex-col bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden border border-white/50 shadow-sm ${className}`}>
        {regions.map((r, index) => {
          const isActive = region === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 
                transition-all duration-200
                ${index > 0 ? 'border-t border-gray-100' : ''}
                ${isActive 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-sm">{r.icon}</span>
              <span className="font-bold text-xs">{isArabic ? r.name : r.nameEn}</span>
              {isActive && <Check className="w-3 h-3 mr-auto" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact variant - مضغوط للشريط العلوي (فوق بعض)
  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        {/* عنوان صغير جداً */}
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 text-emerald-200" />
          <span className="text-[10px] font-bold text-white/70">
            {isArabic ? 'منطقتك' : 'Your Area'}
          </span>
        </div>
        
        {/* الأزرار فوق بعض - مضغوطة جداً */}
        <div className="flex flex-col bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20">
          {regions.map((r, index) => {
            const isActive = region === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`
                  relative flex items-center gap-2 px-3 py-1.5 
                  transition-all duration-300 ease-out
                  ${index > 0 ? 'border-t border-white/10' : ''}
                  ${isActive 
                    ? 'bg-white text-emerald-600' 
                    : 'text-white/90 hover:bg-white/10'
                  }
                `}
              >
                {/* أيقونة صغيرة */}
                <span className={`text-sm transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {r.icon}
                </span>
                
                {/* النص */}
                <span className={`font-bold text-xs transition-colors duration-300 ${isActive ? 'text-emerald-700' : 'text-white'}`}>
                  {isArabic ? r.name : r.nameEn}
                </span>
                
                {/* علامة الاختيار */}
                {isActive && (
                  <Check className="w-3 h-3 text-emerald-600 mr-auto animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Light variant - خفيف للاستخدام داخل الأقسام (فوق بعض)
  if (variant === 'light') {
    return (
      <div className={`inline-flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm ${className}`}>
        {regions.map((r, index) => {
          const isActive = region === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`
                flex items-center gap-2 px-3 py-2 
                transition-all duration-200
                ${index > 0 ? 'border-t border-gray-200' : ''}
                ${isActive 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-base">{r.icon}</span>
              <span className="font-bold text-sm">{isArabic ? r.name : r.nameEn}</span>
              {isActive && <Check className="w-4 h-4 mr-auto" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Default - mini (مناسب للخلفية البيضاء في الأقسام)
  return (
    <RegionSelector variant="mini" className={className} />
  );
}
