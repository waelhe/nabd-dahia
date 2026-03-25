'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Building, Heart, Star, ChevronLeft, ChevronRight, Users, BriefcaseBusiness, Code, Stethoscope, GraduationCap, User, Award, Mail, Phone, Search, Building2, UserCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionSelector from './RegionSelector';
import { useRegion, Region } from '@/contexts/RegionContext';

// ==================== أنواع البيانات ====================

interface Job {
  id: string;
  title: string;
  titleEn: string;
  company: string;
  companyEn: string;
  location: string;
  type: 'full-time' | 'part-time' | 'remote';
  typeAr: string;
  typeEn: string;
  salary: string;
  posted: string;
  urgent?: boolean;
  featured?: boolean;
  category: 'tech' | 'medical' | 'education' | 'sales' | 'admin' | 'other';
  categoryAr: string;
  categoryEn: string;
  rating: number;
  reviews: number;
  images: string[];
  description?: string;
  descriptionEn?: string;
}

interface JobSeeker {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  category: 'tech' | 'medical' | 'education' | 'sales' | 'admin' | 'other';
  categoryAr: string;
  categoryEn: string;
  experience: string;
  experienceEn: string;
  skills: string[];
  skillsEn: string[];
  location: string;
  available: boolean;
  image: string;
  rating: number;
  featured?: boolean;
  phone: string;
  email?: string;
  cv?: string;
}

// ==================== بيانات الوظائف الشاغرة ====================

const qudsayaCenterJobs: Job[] = [
  {
    id: '1',
    title: 'مهندس برمجيات',
    titleEn: 'Software Engineer',
    company: 'شركة تقنية المعلومات',
    companyEn: 'IT Company',
    location: 'قدسيا - المركز',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '500-800$',
    posted: 'منذ يوم',
    featured: true,
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    rating: 4.8,
    reviews: 12,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'مطلوب مهندس برمجيات بخبرة 3+ سنوات',
    descriptionEn: 'Software engineer with 3+ years experience required'
  },
  {
    id: '2',
    title: 'محاسب',
    titleEn: 'Accountant',
    company: 'مؤسسة تجارية',
    companyEn: 'Trading Company',
    location: 'قدسيا',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '300-450$',
    posted: 'منذ يومين',
    category: 'admin',
    categoryAr: 'إدارة',
    categoryEn: 'Admin',
    rating: 4.5,
    reviews: 8,
    images: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '3',
    title: 'معلم لغة إنجليزية',
    titleEn: 'English Teacher',
    company: 'معهد لغات',
    companyEn: 'Language Institute',
    location: 'قدسيا',
    type: 'part-time',
    typeAr: 'دوام جزئي',
    typeEn: 'Part-time',
    salary: '200-350$',
    posted: 'منذ 3 أيام',
    urgent: true,
    category: 'education',
    categoryAr: 'تعليم',
    categoryEn: 'Education',
    rating: 4.7,
    reviews: 15,
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '4',
    title: 'مصمم جرافيك',
    titleEn: 'Graphic Designer',
    company: 'وكالة إعلانات',
    companyEn: 'Advertising Agency',
    location: 'قدسيا',
    type: 'remote',
    typeAr: 'عن بعد',
    typeEn: 'Remote',
    salary: '250-400$',
    posted: 'منذ أسبوع',
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    rating: 4.6,
    reviews: 6,
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '5',
    title: 'طبيب أسنان',
    titleEn: 'Dentist',
    company: 'عيادة خاصة',
    companyEn: 'Private Clinic',
    location: 'قدسيا',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: 'حسب الخبرة',
    posted: 'منذ 5 أيام',
    featured: true,
    category: 'medical',
    categoryAr: 'طبي',
    categoryEn: 'Medical',
    rating: 4.9,
    reviews: 22,
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '6',
    title: 'سائق توصيل',
    titleEn: 'Delivery Driver',
    company: 'مطعم',
    companyEn: 'Restaurant',
    location: 'قدسيا',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '150$ + نسبة',
    posted: 'منذ ساعتين',
    urgent: true,
    category: 'other',
    categoryAr: 'أخرى',
    categoryEn: 'Other',
    rating: 4.3,
    reviews: 5,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    ]
  }
];

const qudsayaDahiaJobs: Job[] = [
  {
    id: '1',
    title: 'مهندس مدني',
    titleEn: 'Civil Engineer',
    company: 'شركة مقاولات',
    companyEn: 'Construction Company',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '600-900$',
    posted: 'منذ يوم',
    featured: true,
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    rating: 4.7,
    reviews: 14,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '2',
    title: 'محاسب',
    titleEn: 'Accountant',
    company: 'مؤسسة تجارية',
    companyEn: 'Trading Company',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '350-500$',
    posted: 'منذ يومين',
    category: 'admin',
    categoryAr: 'إدارة',
    categoryEn: 'Admin',
    rating: 4.4,
    reviews: 7,
    images: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '3',
    title: 'معلم رياضيات',
    titleEn: 'Math Teacher',
    company: 'مدرسة خاصة',
    companyEn: 'Private School',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '300-450$',
    posted: 'منذ 4 أيام',
    category: 'education',
    categoryAr: 'تعليم',
    categoryEn: 'Education',
    rating: 4.6,
    reviews: 11,
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '4',
    title: 'مدير مبيعات',
    titleEn: 'Sales Manager',
    company: 'شركة تجارية',
    companyEn: 'Trading Company',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '400-600$ + عمولات',
    posted: 'منذ يومين',
    category: 'sales',
    categoryAr: 'مبيعات',
    categoryEn: 'Sales',
    rating: 4.5,
    reviews: 9,
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '5',
    title: 'صيدلي',
    titleEn: 'Pharmacist',
    company: 'صيدلية',
    companyEn: 'Pharmacy',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '400-600$',
    posted: 'منذ 3 أيام',
    featured: true,
    category: 'medical',
    categoryAr: 'طبي',
    categoryEn: 'Medical',
    rating: 4.8,
    reviews: 16,
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    ]
  },
  {
    id: '6',
    title: 'سائق توصيل',
    titleEn: 'Delivery Driver',
    company: 'سوبر ماركت',
    companyEn: 'Supermarket',
    location: 'الضاحية',
    type: 'full-time',
    typeAr: 'دوام كامل',
    typeEn: 'Full-time',
    salary: '180$ + نسبة',
    posted: 'منذ ساعة',
    urgent: true,
    category: 'other',
    categoryAr: 'أخرى',
    categoryEn: 'Other',
    rating: 4.2,
    reviews: 4,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    ]
  }
];

// ==================== بيانات الباحثين عن عمل ====================

const qudsayaCenterSeekers: JobSeeker[] = [
  {
    id: 's1',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    title: 'مطور برمجيات',
    titleEn: 'Software Developer',
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    experience: '5 سنوات',
    experienceEn: '5 years',
    skills: ['React', 'Node.js', 'Python', 'SQL'],
    skillsEn: ['React', 'Node.js', 'Python', 'SQL'],
    location: 'قدسيا',
    available: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    featured: true,
    phone: '0999123456',
    email: 'ahmed@email.com'
  },
  {
    id: 's2',
    name: 'سارة أحمد',
    nameEn: 'Sara Ahmed',
    title: 'محاسبة',
    titleEn: 'Accountant',
    category: 'admin',
    categoryAr: 'إدارة',
    categoryEn: 'Admin',
    experience: '3 سنوات',
    experienceEn: '3 years',
    skills: ['Excel', 'QuickBooks', 'SAP', 'Tally'],
    skillsEn: ['Excel', 'QuickBooks', 'SAP', 'Tally'],
    location: 'قدسيا',
    available: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    phone: '0999234567',
    email: 'sara@email.com'
  },
  {
    id: 's3',
    name: 'محمد علي',
    nameEn: 'Mohammed Ali',
    title: 'معلم لغة إنجليزية',
    titleEn: 'English Teacher',
    category: 'education',
    categoryAr: 'تعليم',
    categoryEn: 'Education',
    experience: '7 سنوات',
    experienceEn: '7 years',
    skills: ['Teaching', 'IELTS', 'TOEFL', 'Curriculum Design'],
    skillsEn: ['Teaching', 'IELTS', 'TOEFL', 'Curriculum Design'],
    location: 'قدسيا - المركز',
    available: true,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    featured: true,
    phone: '0999345678'
  },
  {
    id: 's4',
    name: 'فاطمة حسن',
    nameEn: 'Fatima Hassan',
    title: 'مصممة جرافيك',
    titleEn: 'Graphic Designer',
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    experience: '4 سنوات',
    experienceEn: '4 years',
    skills: ['Photoshop', 'Illustrator', 'Figma', 'UI/UX'],
    skillsEn: ['Photoshop', 'Illustrator', 'Figma', 'UI/UX'],
    location: 'قدسيا',
    available: true,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    phone: '0999456789'
  },
  {
    id: 's5',
    name: 'خالد عمر',
    nameEn: 'Khaled Omar',
    title: 'طبيب أسنان',
    titleEn: 'Dentist',
    category: 'medical',
    categoryAr: 'طبي',
    categoryEn: 'Medical',
    experience: '10 سنوات',
    experienceEn: '10 years',
    skills: ['Orthodontics', 'Oral Surgery', 'Cosmetic Dentistry'],
    skillsEn: ['Orthodontics', 'Oral Surgery', 'Cosmetic Dentistry'],
    location: 'قدسيا',
    available: false,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    featured: true,
    phone: '0999567890'
  },
  {
    id: 's6',
    name: 'نور الدين',
    nameEn: 'Nour Aldeen',
    title: 'سائق توصيل',
    titleEn: 'Delivery Driver',
    category: 'other',
    categoryAr: 'أخرى',
    categoryEn: 'Other',
    experience: '2 سنوات',
    experienceEn: '2 years',
    skills: ['قيادة', 'معرفة المنطقة', 'التواصل الجيد'],
    skillsEn: ['Driving', 'Area Knowledge', 'Good Communication'],
    location: 'قدسيا',
    available: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 4.5,
    phone: '0999678901'
  }
];

const qudsayaDahiaSeekers: JobSeeker[] = [
  {
    id: 's1',
    name: 'عمر خالد',
    nameEn: 'Omar Khaled',
    title: 'مهندس مدني',
    titleEn: 'Civil Engineer',
    category: 'tech',
    categoryAr: 'تقنية',
    categoryEn: 'Tech',
    experience: '6 سنوات',
    experienceEn: '6 years',
    skills: ['AutoCAD', 'Project Management', 'Structural Design'],
    skillsEn: ['AutoCAD', 'Project Management', 'Structural Design'],
    location: 'الضاحية',
    available: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    featured: true,
    phone: '0999789012'
  },
  {
    id: 's2',
    name: 'ليلى محمد',
    nameEn: 'Layla Mohammed',
    title: 'محاسبة',
    titleEn: 'Accountant',
    category: 'admin',
    categoryAr: 'إدارة',
    categoryEn: 'Admin',
    experience: '4 سنوات',
    experienceEn: '4 years',
    skills: ['Excel', 'QuickBooks', 'Financial Reporting'],
    skillsEn: ['Excel', 'QuickBooks', 'Financial Reporting'],
    location: 'الضاحية',
    available: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    phone: '0999890123'
  },
  {
    id: 's3',
    name: 'حسن يوسف',
    nameEn: 'Hassan Youssef',
    title: 'معلم رياضيات',
    titleEn: 'Math Teacher',
    category: 'education',
    categoryAr: 'تعليم',
    categoryEn: 'Education',
    experience: '8 سنوات',
    experienceEn: '8 years',
    skills: ['Teaching', 'Curriculum Development', 'Student Engagement'],
    skillsEn: ['Teaching', 'Curriculum Development', 'Student Engagement'],
    location: 'الضاحية',
    available: true,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    featured: true,
    phone: '0999901234'
  },
  {
    id: 's4',
    name: 'رنا أحمد',
    nameEn: 'Rana Ahmed',
    title: 'مديرة مبيعات',
    titleEn: 'Sales Manager',
    category: 'sales',
    categoryAr: 'مبيعات',
    categoryEn: 'Sales',
    experience: '5 سنوات',
    experienceEn: '5 years',
    skills: ['Sales Strategy', 'Team Leadership', 'CRM'],
    skillsEn: ['Sales Strategy', 'Team Leadership', 'CRM'],
    location: 'الضاحية - المركز التجاري',
    available: true,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    phone: '0999012345'
  },
  {
    id: 's5',
    name: 'سمير حسين',
    nameEn: 'Samir Hussein',
    title: 'صيدلي',
    titleEn: 'Pharmacist',
    category: 'medical',
    categoryAr: 'طبي',
    categoryEn: 'Medical',
    experience: '3 سنوات',
    experienceEn: '3 years',
    skills: ['Pharmaceutical Care', 'Patient Counseling', 'Inventory Management'],
    skillsEn: ['Pharmaceutical Care', 'Patient Counseling', 'Inventory Management'],
    location: 'الضاحية',
    available: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    rating: 4.5,
    phone: '0999123456'
  },
  {
    id: 's6',
    name: 'ياسر محمود',
    nameEn: 'Yasser Mahmoud',
    title: 'سائق',
    titleEn: 'Driver',
    category: 'other',
    categoryAr: 'أخرى',
    categoryEn: 'Other',
    experience: '3 سنوات',
    experienceEn: '3 years',
    skills: ['قيادة', 'معرفة الطرق', 'التواصل'],
    skillsEn: ['Driving', 'Road Knowledge', 'Communication'],
    location: 'الضاحية',
    available: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 4.4,
    phone: '0999234567'
  }
];

// ==================== البيانات حسب المنطقة ====================

const jobsByRegion: Record<Region, Job[]> = {
  'qudsaya-center': qudsayaCenterJobs,
  'qudsaya-dahia': qudsayaDahiaJobs
};

const seekersByRegion: Record<Region, JobSeeker[]> = {
  'qudsaya-center': qudsayaCenterSeekers,
  'qudsaya-dahia': qudsayaDahiaSeekers
};

// ==================== الفلاتر ====================

const categoryFilters = [
  { id: 'all', name: 'الكل', nameEn: 'All', icon: Briefcase },
  { id: 'tech', name: 'تقنية', nameEn: 'Tech', icon: Code },
  { id: 'medical', name: 'طبي', nameEn: 'Medical', icon: Stethoscope },
  { id: 'education', name: 'تعليم', nameEn: 'Education', icon: GraduationCap },
  { id: 'admin', name: 'إدارة', nameEn: 'Admin', icon: Building },
  { id: 'sales', name: 'مبيعات', nameEn: 'Sales', icon: BriefcaseBusiness },
];

const typeStyles = {
  'full-time': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'part-time': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'remote': { bg: 'bg-teal-100', text: 'text-teal-700' }
};

// ==================== المكون الرئيسي ====================

export default function Jobs() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { region, regionName } = useRegion();
  const jobs = jobsByRegion[region];
  const seekers = seekersByRegion[region];
  
  // التبويب النشط: 'jobs' أو 'seekers'
  const [activeTab, setActiveTab] = useState<'jobs' | 'seekers'>('jobs');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // تصفية البيانات
  const filteredJobs = jobs.filter(job => activeCategory === 'all' || job.category === activeCategory);
  const filteredSeekers = seekers.filter(seeker => activeCategory === 'all' || seeker.category === activeCategory);
  const currentData = activeTab === 'jobs' ? filteredJobs : filteredSeekers;

  // فحص التمرير
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, [currentData]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-5 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {isArabic ? 'سوق العمل' : 'Job Market'}
              </h2>
              <p className="text-sm text-gray-500">
                {isArabic ? `فرص وباحثون عن عمل في ${regionName}` : `Opportunities & seekers in ${regionName}`}
              </p>
            </div>
          </div>
          <RegionSelector variant="mini" />
        </div>

        {/* Main Tabs - تبديل بين الوظائف والباحثين */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <div className="text-right">
              <div>{isArabic ? 'فرص عمل' : 'Job Openings'}</div>
              <div className="text-xs font-normal opacity-80">{jobs.length} {isArabic ? 'فرصة' : 'jobs'}</div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('seekers')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'seekers'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-emerald-300'
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <div className="text-right">
              <div>{isArabic ? 'باحثون عن عمل' : 'Job Seekers'}</div>
              <div className="text-xs font-normal opacity-80">{seekers.length} {isArabic ? 'شخص' : 'seekers'}</div>
            </div>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.id;
            const count = filter.id === 'all' 
              ? (activeTab === 'jobs' ? jobs.length : seekers.length)
              : (activeTab === 'jobs' ? jobs.filter(j => j.category === filter.id).length : seekers.filter(s => s.category === filter.id).length);
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[70px] transition-all ${
                  isActive 
                    ? (activeTab === 'jobs' ? 'bg-gray-900 text-white' : 'bg-emerald-700 text-white')
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{isArabic ? filter.name : filter.nameEn}</span>
                <span className={`text-[10px] ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* تلميح للمستخدم */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            👈 {isArabic ? 'اسحب لليسار لرؤية المزيد' : 'Swipe left to see more'}
          </p>
          <div className="flex gap-1">
            {currentData.slice(0, 6).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === 0 ? 'bg-blue-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Container - محسن */}
        <div className="relative">
          {/* Navigation Buttons - دائمة */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollLeft 
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 ${
              canScrollRight 
                ? 'opacity-100 hover:scale-110 hover:bg-gray-50 animate-pulse' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Scrollable Cards - مع تأثير التدرج */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-1 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)'
            }}
          >
            {activeTab === 'jobs' ? (
              // ==================== بطاقات الوظائف ====================
              filteredJobs.map((job, index) => {
                const isFavorite = favorites.includes(job.id);
                const styles = typeStyles[job.type];
                
                return (
                  <div
                    key={job.id}
                    className="flex-shrink-0 w-[280px] sm:w-[300px] cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                      {/* Image Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                        <img 
                          src={job.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(job.id); }}
                          className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                        >
                          <Heart 
                            className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white drop-shadow-lg'}`} 
                          />
                        </button>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${styles.bg} ${styles.text}`}>
                            {isArabic ? job.typeAr : job.typeEn}
                          </span>
                        </div>

                        {/* Featured/Urgent Badge */}
                        {(job.featured || job.urgent) && (
                          <div className="absolute bottom-2 right-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              job.featured ? 'bg-amber-500 text-white' : 'bg-red-500 text-white animate-pulse'
                            }`}>
                              {job.featured ? (isArabic ? 'مميز' : 'Featured') : (isArabic ? 'عاجل' : 'Urgent')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="px-1">
                        {/* Company & Rating */}
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {isArabic ? job.company : job.companyEn}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
                            <span className="text-[10px] font-bold">{job.rating}</span>
                            <span className="text-[10px] text-gray-400">({job.reviews})</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                          {isArabic ? job.title : job.titleEn}
                        </h3>

                        {/* Location & Time */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{job.posted}</span>
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="flex items-center gap-1 text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salary}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // ==================== بطاقات الباحثين عن عمل ====================
                filteredSeekers.map((seeker, index) => {
                  const isFavorite = favorites.includes(seeker.id);
                  
                  return (
                    <div
                      key={seeker.id}
                      className="flex-shrink-0 w-[280px] sm:w-[300px] cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Card */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Header with Image */}
                        <div className="relative p-4 bg-gradient-to-br from-emerald-50 to-teal-50">
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(seeker.id); }}
                            className="absolute top-2 right-2 p-1.5 transition-transform hover:scale-110"
                          >
                            <Heart 
                              className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} 
                            />
                          </button>

                          {/* Featured Badge */}
                          {seeker.featured && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                {isArabic ? 'مميز' : 'Featured'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              <img 
                                src={seeker.image} 
                                alt=""
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                                seeker.available ? 'bg-emerald-500' : 'bg-gray-400'
                              } flex items-center justify-center`}>
                                <span className="text-white text-[8px]">✓</span>
                              </div>
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-900">
                                {isArabic ? seeker.name : seeker.nameEn}
                              </h3>
                              <p className="text-sm text-emerald-600 font-medium">
                                {isArabic ? seeker.title : seeker.titleEn}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-bold">{seeker.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3">
                          {/* Category Badge */}
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            {isArabic ? seeker.categoryAr : seeker.categoryEn}
                          </span>

                          {/* Experience & Location */}
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>{isArabic ? seeker.experience : seeker.experienceEn}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{seeker.location}</span>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(isArabic ? seeker.skills : seeker.skillsEn).slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Availability */}
                          <div className={`mt-2 text-[10px] font-bold flex items-center gap-1 ${
                            seeker.available ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${seeker.available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {seeker.available ? (isArabic ? 'متاح للعمل' : 'Available') : (isArabic ? 'غير متاح حالياً' : 'Not available')}
                          </div>

                          {/* Contact Buttons */}
                          <div className="flex gap-2 mt-3">
                            <a
                              href={`tel:${seeker.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {isArabic ? 'اتصل' : 'Call'}
                            </a>
                            {seeker.email && (
                              <a
                                href={`mailto:${seeker.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {isArabic ? 'بريد' : 'Email'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </div>

        {/* Empty State */}
        {currentData.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {activeTab === 'jobs' 
                ? (isArabic ? 'لا توجد وظائف بهذا التصنيف' : 'No jobs in this category')
                : (isArabic ? 'لا يوجد باحثون عن عمل بهذا التصنيف' : 'No seekers in this category')
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
