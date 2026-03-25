/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Footer Component
 * 
 * شريط التنقل السفلي - نبض قدسيا
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  const content = {
    ar: {
      about: 'نبض الضاحية وقدسيا - منصتك المحلية لكل ما تحتاجه. صيدليات مناوبة، أطباء، سوق محلي، عقارات، ومجتمع نشط.',
      quickLinks: 'روابط سريعة',
      contact: 'تواصل معنا',
      rights: 'نبض الضاحية وقدسيا - جميع الحقوق محفوظة',
      links: [
        { name: 'الرئيسية', path: '/' },
        { name: 'السوق', path: '/marketplace' },
        { name: 'العقارات', path: '/realestate' },
        { name: 'المجتمع', path: '/community' },
      ],
      services: [
        { name: 'صيدليات مناوبة', path: '/pharmacies' },
        { name: 'أطباء', path: '/doctors' },
        { name: 'خدمات', path: '/services' },
      ],
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
    },
    en: {
      about: 'Nabd Dahia & Qudsaya - Your local platform for everything you need. On-duty pharmacies, doctors, local market, real estate, and active community.',
      quickLinks: 'Quick Links',
      contact: 'Contact Us',
      rights: 'Nabd Dahia & Qudsaya - All rights reserved',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Market', path: '/marketplace' },
        { name: 'Real Estate', path: '/realestate' },
        { name: 'Community', path: '/community' },
      ],
      services: [
        { name: 'On-Duty Pharmacies', path: '/pharmacies' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'Services', path: '/services' },
      ],
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    }
  };

  const t = language === 'ar' ? content.ar : content.en;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-8 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-xl font-black text-white">
                {language === 'ar' ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              {t.about}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {t.links.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </h3>
            <ul className="space-y-2">
              {t.services.map((service) => (
                <li key={service.path}>
                  <Link href={service.path} className="text-sm hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-all" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm">{language === 'ar' ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm" dir="ltr">+963 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm">info@nabdqudsaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t.rights}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
