/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Header Component
 * 
 * شريط التنقل العلوي - نبض قدسيا
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, Menu, LogIn, LogOut, Globe, Heart, MapPin, Store, Home, Briefcase, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isArabic = language === 'ar';

  // الأقسام الرئيسية
  const mainSections = [
    { id: 'market', name: 'السوق', nameEn: 'Market', icon: Store },
    { id: 'realestate', name: 'عقارات', nameEn: 'Real Estate', icon: Home },
    { id: 'jobs', name: 'وظائف', nameEn: 'Jobs', icon: Briefcase },
    { id: 'community', name: 'مجتمع', nameEn: 'Community', icon: Users },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">ن</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black text-gray-900">
                {isArabic ? 'نبض الضاحية وقدسيا' : 'Nabd Dahia & Qudsaya'}
              </span>
            </div>
          </Link>

          {/* Main Sections Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{isArabic ? section.name : section.nameEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Location Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {isArabic ? 'قدسيا، ريف دمشق' : 'Qudsaya, Damascus Suburbs'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all bg-white"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60]`}>
                  {/* Main Sections - Mobile */}
                  <div className="lg:hidden border-b border-gray-100 pb-2 mb-2">
                    {mainSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Link
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />
                          {isArabic ? section.name : section.nameEn}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {!user ? (
                    <Link 
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full px-4 py-3 text-sm font-medium hover:bg-emerald-50 flex items-center gap-3 text-emerald-600"
                    >
                      <LogIn className="w-4 h-4" />
                      {isArabic ? 'تسجيل الدخول' : 'Login'}
                    </Link>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">
                        {isArabic ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">
                        {isArabic ? 'حجوزاتي' : 'My Bookings'}
                      </Link>
                      <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {isArabic ? 'المفضلة' : 'Favorites'}
                      </Link>
                      <div className="h-[1px] bg-gray-100 my-1" />
                      <button 
                        onClick={() => { signOut(); setIsMenuOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        {isArabic ? 'تسجيل الخروج' : 'Logout'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
