/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Seed Data - بيانات تجريبية لمنصة ضيف
 * 
 * يحتوي على:
 * - مستخدمين تجريبيين (ضيوف، مضيفين، أدمن)
 * - إقامات متنوعة في مدن سورية
 * - حجوزات تجريبية
 * - تقييمات
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All enums are strings in this schema
const UserStatus = {
  active: 'active',
  pending: 'pending',
  suspended: 'suspended',
  deleted: 'deleted',
} as const;

const UserRole = {
  super_admin: 'super_admin',
  admin: 'admin',
  host: 'host',
  company: 'company',
  user: 'user',
  guest: 'guest',
} as const;

const BookingStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  rejected: 'rejected',
  completed: 'completed',
  in_progress: 'in_progress',
  no_show: 'no_show',
} as const;

const ListingType = {
  apartment: 'apartment',
  hotel: 'hotel',
  villa: 'villa',
  chalet: 'chalet',
  tour: 'tour',
  medical: 'medical',
  education: 'education',
  business: 'business',
} as const;

async function main() {
  console.log('🌱 بدء إنشاء البيانات التجريبية...');

  // ==================== Users ====================
  console.log('👥 إنشاء المستخدمين...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dayf.sy' },
    update: {},
    create: {
      email: 'admin@dayf.sy',
      phone: '+963911111111',
      passwordHash: '$2b$10$dummyHashForTestingPurposesOnly',
      firstName: 'مدير',
      lastName: 'النظام',
      displayName: 'مدير النظام',
      status: UserStatus.active,
      role: UserRole.super_admin,
      emailVerifiedAt: new Date(),
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
    },
  });

  const hostUser1 = await prisma.user.upsert({
    where: { email: 'ahmad@dayf.sy' },
    update: {},
    create: {
      email: 'ahmad@dayf.sy',
      phone: '+963922222222',
      passwordHash: '$2b$10$dummyHashForTestingPurposesOnly',
      firstName: 'أحمد',
      lastName: 'الدمشقي',
      displayName: 'أحمد الدمشقي',
      bio: 'مضيف محترف في دمشق القديمة',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      status: UserStatus.active,
      role: UserRole.host,
      emailVerifiedAt: new Date(),
      isSuperhost: true,
      totalListings: 3,
      responseRate: 98,
      responseTime: 30,
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
      city: 'دمشق',
      country: 'سوريا',
    },
  });

  const hostUser2 = await prisma.user.upsert({
    where: { email: 'sara@dayf.sy' },
    update: {},
    create: {
      email: 'sara@dayf.sy',
      phone: '+963933333333',
      passwordHash: '$2b$10$dummyHashForTestingPurposesOnly',
      firstName: 'سارة',
      lastName: 'الحلبي',
      displayName: 'سارة الحلبي',
      bio: 'أستاذة جامعية ومضيفة لشقق فندقية',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      status: UserStatus.active,
      role: UserRole.host,
      emailVerifiedAt: new Date(),
      isSuperhost: true,
      totalListings: 2,
      responseRate: 100,
      responseTime: 15,
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
      city: 'حلب',
      country: 'سوريا',
    },
  });

  const hostUser3 = await prisma.user.upsert({
    where: { email: 'omar@dayf.sy' },
    update: {},
    create: {
      email: 'omar@dayf.sy',
      phone: '+963944444444',
      passwordHash: '$2b$10$dummyHashForTestingPurposesOnly',
      firstName: 'عمر',
      lastName: 'اللاذقي',
      displayName: 'عمر اللاذقي',
      bio: 'صاحب منتجع ساحلي في اللاذقية',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      status: UserStatus.active,
      role: UserRole.host,
      emailVerifiedAt: new Date(),
      isSuperhost: false,
      totalListings: 2,
      responseRate: 85,
      responseTime: 60,
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
      city: 'لاذقية',
      country: 'سوريا',
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@dayf.sy' },
    update: {},
    create: {
      email: 'guest@dayf.sy',
      phone: '+963955555555',
      passwordHash: '$2b$10$dummyHashForTestingPurposesOnly',
      firstName: 'محمد',
      lastName: 'السياح',
      displayName: 'محمد السياح',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop',
      status: UserStatus.active,
      role: UserRole.user,
      emailVerifiedAt: new Date(),
      preferredLanguage: 'ar',
      preferredCurrency: 'SYP',
      city: 'حمص',
      country: 'سوريا',
    },
  });

  console.log('✅ تم إنشاء 5 مستخدمين');

  // ==================== Listings ====================
  console.log('🏠 إنشاء الإقامات...');

  // Listing 1 - Traditional House in Damascus
  const listing1 = await prisma.listing.create({
    data: {
      hostId: hostUser1.id,
      title: 'بيت دمشقي تقليدي في قلب المدينة القديمة',
      slug: 'damascene-house-old-city-' + Date.now(),
      description: 'بيت دمشقي أصيل يعود للقرن التاسع عشر، تم تجديده بالكامل مع الحفاظ على طابعه التراثي. يتميز بفناء داخلي (وسط دار) ونافورة وأشجار ياسمين. يقع في حي العمارة بالقرب من الجامع الأموي والأسواق القديمة. مثالي للعائلات والمهتمين بالتراث والثقافة.',
      type: ListingType.apartment,
      category: 'tourism',
      country: 'سوريا',
      city: 'دمشق',
      address: 'حي العمارة، المدينة القديمة',
      neighborhood: 'العمارة',
      latitude: 33.5138,
      longitude: 36.3078,
      capacity: 6,
      bedrooms: 3,
      bathrooms: 2,
      beds: 5,
      size: 180,
      basePrice: 150000,
      currency: 'SYP',
      cleaningFee: 20000,
      securityDeposit: 100000,
      minNights: 2,
      maxNights: 30,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      instantBook: false,
      cancellationPolicy: 'moderate',
      smokingAllowed: false,
      petsAllowed: true,
      partiesAllowed: false,
      status: 'active',
      publishedAt: new Date(),
      featured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ratingAverage: 4.9,
      ratingCount: 28,
      viewCount: 1250,
      bookingCount: 45,
      favoriteCount: 89,
    },
  });

  // Add images for listing 1
  await prisma.listingImage.createMany({
    data: [
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'الواجهة الرئيسية', isPrimary: true, order: 0 },
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', caption: 'الفناء الداخلي', isPrimary: false, order: 1 },
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', caption: 'غرفة المعيشة', isPrimary: false, order: 2 },
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', caption: 'غرفة النوم الرئيسية', isPrimary: false, order: 3 },
    ],
  });

  // Add amenities for listing 1
  await prisma.listingAmenity.createMany({
    data: [
      { listingId: listing1.id, name: 'واي فاي مجاني', icon: 'wifi', category: 'general', included: true },
      { listingId: listing1.id, name: 'مكيّف هواء', icon: 'snowflake', category: 'general', included: true },
      { listingId: listing1.id, name: 'مطبخ مجهز', icon: 'chef-hat', category: 'general', included: true },
      { listingId: listing1.id, name: 'غسالة ملابس', icon: 'washing-machine', category: 'general', included: true },
      { listingId: listing1.id, name: 'مواقف سيارات', icon: 'car', category: 'general', included: true },
      { listingId: listing1.id, name: 'فناء داخلي', icon: 'home', category: 'features', included: true },
      { listingId: listing1.id, name: 'نافورة', icon: 'droplets', category: 'features', included: true },
      { listingId: listing1.id, name: 'حديقة', icon: 'flower-2', category: 'features', included: true },
    ],
  });

  // Listing 2 - Hotel Suite in Aleppo
  const listing2 = await prisma.listing.create({
    data: {
      hostId: hostUser2.id,
      title: 'جناح فاخر في فندق حلب التاريخي',
      slug: 'luxury-suite-aleppo-hotel-' + Date.now(),
      description: 'جناح فاخر في قلب حلب القديمة، قريب من قلعة حلب والأسواق الشهيرة. يتميز بتصميم يجمع بين الأصالة والحداثة، مع إطلالة رائعة على القلعة. مناسب للسياح ورجال الأعمال.',
      type: ListingType.hotel,
      category: 'tourism',
      country: 'سوريا',
      city: 'حلب',
      address: 'الجلوم، قرب قلعة حلب',
      neighborhood: 'الجلوم',
      latitude: 36.2021,
      longitude: 37.1343,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      beds: 3,
      size: 85,
      basePrice: 200000,
      currency: 'SYP',
      cleaningFee: 15000,
      minNights: 1,
      maxNights: 14,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      instantBook: true,
      cancellationPolicy: 'flexible',
      status: 'active',
      publishedAt: new Date(),
      featured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ratingAverage: 4.7,
      ratingCount: 42,
      viewCount: 980,
      bookingCount: 67,
      favoriteCount: 56,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing2.id, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', caption: 'الجناح الرئيسي', isPrimary: true, order: 0 },
      { listingId: listing2.id, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', caption: 'غرفة النوم', isPrimary: false, order: 1 },
      { listingId: listing2.id, url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', caption: 'الحمام', isPrimary: false, order: 2 },
    ],
  });

  await prisma.listingAmenity.createMany({
    data: [
      { listingId: listing2.id, name: 'واي فاي مجاني', icon: 'wifi', category: 'general', included: true },
      { listingId: listing2.id, name: 'تكييف', icon: 'snowflake', category: 'general', included: true },
      { listingId: listing2.id, name: 'تلفزيون ذكي', icon: 'tv', category: 'general', included: true },
      { listingId: listing2.id, name: 'خدمة الغرف', icon: 'bell', category: 'services', included: true },
      { listingId: listing2.id, name: 'إفطار مجاني', icon: 'coffee', category: 'services', included: true },
    ],
  });

  // Listing 3 - Beach Chalet in Latakia
  const listing3 = await prisma.listing.create({
    data: {
      hostId: hostUser3.id,
      title: 'شاليه ساحري على شاطئ اللاذقية',
      slug: 'beach-chalet-latakia-' + Date.now(),
      description: 'شاليه راقي على الشاطئ مباشرة، مع إطلالة بحرية خلابة. يضم حديقة خاصة ومساحة للشواء. مناسب للعطلات العائلية ومحبي البحر. قريب من المطاعم والكافيهات الشاطئية.',
      type: ListingType.chalet,
      category: 'tourism',
      country: 'سوريا',
      city: 'لاذقية',
      address: 'شاطئ اللاذقية، المنطقة السياحية',
      latitude: 35.5227,
      longitude: 35.7942,
      capacity: 8,
      bedrooms: 4,
      bathrooms: 2,
      beds: 6,
      size: 200,
      basePrice: 250000,
      currency: 'SYP',
      cleaningFee: 30000,
      securityDeposit: 150000,
      minNights: 2,
      maxNights: 21,
      checkInTime: '16:00',
      checkOutTime: '10:00',
      instantBook: false,
      cancellationPolicy: 'moderate',
      status: 'active',
      publishedAt: new Date(),
      featured: false,
      ratingAverage: 4.8,
      ratingCount: 35,
      viewCount: 876,
      bookingCount: 38,
      favoriteCount: 72,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing3.id, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'إطلالة بحرية', isPrimary: true, order: 0 },
      { listingId: listing3.id, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'المسبح', isPrimary: false, order: 1 },
      { listingId: listing3.id, url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', caption: 'الشاليه', isPrimary: false, order: 2 },
    ],
  });

  await prisma.listingAmenity.createMany({
    data: [
      { listingId: listing3.id, name: 'شاطئ خاص', icon: 'waves', category: 'features', included: true },
      { listingId: listing3.id, name: 'مسبح', icon: 'bath', category: 'features', included: true },
      { listingId: listing3.id, name: 'شوائية', icon: 'flame', category: 'outdoor', included: true },
      { listingId: listing3.id, name: 'حديقة خاصة', icon: 'flower-2', category: 'outdoor', included: true },
      { listingId: listing3.id, name: 'مطبخ', icon: 'chef-hat', category: 'general', included: true },
    ],
  });

  // Listing 4 - Villa in Tartus
  const listing4 = await prisma.listing.create({
    data: {
      hostId: hostUser3.id,
      title: 'فيلا فاخرة في طرطوس مع حديقة مناظر طبيعية',
      slug: 'luxury-villa-tartus-' + Date.now(),
      description: 'فيلا فاخرة على التلال المطلة على البحر المتوسط. تضم حديقة واسعة ومسبح خاص. مناسبة للمناسبات الخاصة والعطلات العائلية.',
      type: ListingType.villa,
      category: 'tourism',
      country: 'سوريا',
      city: 'طرطوس',
      address: 'التلال الغربية',
      latitude: 34.8959,
      longitude: 35.8867,
      capacity: 10,
      bedrooms: 5,
      bathrooms: 3,
      beds: 8,
      size: 350,
      basePrice: 400000,
      currency: 'SYP',
      cleaningFee: 50000,
      securityDeposit: 200000,
      minNights: 3,
      maxNights: 14,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      instantBook: false,
      cancellationPolicy: 'strict',
      status: 'active',
      publishedAt: new Date(),
      featured: true,
      featuredUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      ratingAverage: 4.6,
      ratingCount: 18,
      viewCount: 543,
      bookingCount: 22,
      favoriteCount: 45,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing4.id, url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', caption: 'الواجهة الرئيسية', isPrimary: true, order: 0 },
      { listingId: listing4.id, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', caption: 'المسبح والحديقة', isPrimary: false, order: 1 },
    ],
  });

  // Listing 5 - Apartment in Homs
  const listing5 = await prisma.listing.create({
    data: {
      hostId: hostUser1.id,
      title: 'شقة عصرية في وسط حمص',
      slug: 'modern-apartment-homs-' + Date.now(),
      description: 'شقة حديثة ومجهزة بالكامل في وسط مدينة حمص. قريبة من جميع الخدمات والمطاعم. مناسبة للإقامات القصيرة والطويلة.',
      type: ListingType.apartment,
      category: 'tourism',
      country: 'سوريا',
      city: 'حمص',
      address: 'حي المروج',
      latitude: 34.7386,
      longitude: 36.7186,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      beds: 3,
      size: 95,
      basePrice: 80000,
      currency: 'SYP',
      cleaningFee: 10000,
      minNights: 1,
      maxNights: 30,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      instantBook: true,
      cancellationPolicy: 'flexible',
      status: 'active',
      publishedAt: new Date(),
      ratingAverage: 4.5,
      ratingCount: 15,
      viewCount: 324,
      bookingCount: 28,
      favoriteCount: 21,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing5.id, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', caption: 'غرفة المعيشة', isPrimary: true, order: 0 },
      { listingId: listing5.id, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', caption: 'غرفة النوم', isPrimary: false, order: 1 },
    ],
  });

  console.log('✅ تم إنشاء 5 إقامات');

  // ==================== Bookings ====================
  console.log('📅 إنشاء الحجوزات...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const booking1 = await prisma.booking.create({
    data: {
      guestId: guestUser.id,
      hostId: hostUser1.id,
      listingId: listing1.id,
      checkIn: tomorrow,
      checkOut: dayAfter,
      guests: 4,
      adults: 4,
      children: 0,
      infants: 0,
      basePrice: 300000, // 2 nights
      cleaningFee: 20000,
      serviceFee: 30000,
      taxes: 15000,
      totalPrice: 365000,
      currency: 'SYP',
      status: BookingStatus.confirmed,
      confirmedAt: new Date(),
      paymentStatus: 'paid',
      paidAt: new Date(),
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const weekAfter = new Date();
  weekAfter.setDate(weekAfter.getDate() + 10);

  const booking2 = await prisma.booking.create({
    data: {
      guestId: guestUser.id,
      hostId: hostUser2.id,
      listingId: listing2.id,
      checkIn: nextWeek,
      checkOut: weekAfter,
      guests: 2,
      adults: 2,
      basePrice: 600000, // 3 nights
      cleaningFee: 15000,
      serviceFee: 60000,
      taxes: 30000,
      totalPrice: 705000,
      currency: 'SYP',
      status: BookingStatus.pending,
      paymentStatus: 'pending',
    },
  });

  console.log('✅ تم إنشاء 2 حجز');

  // ==================== Reviews ====================
  console.log('⭐ إنشاء التقييمات...');

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      listingId: listing1.id,
      reviewerId: guestUser.id,
      revieweeId: hostUser1.id,
      ratingOverall: 5,
      ratingCleanliness: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingCheckIn: 5,
      ratingValue: 5,
      comment: 'تجربة رائعة! البيت أجمل مما توقعت، والمضيف أحمد كان متعاون جداً. الفناء الداخلي ساحر والياسمين يعطي أجواء دمشقية أصيلة. ننصح به بشدة!',
    },
  });

  console.log('✅ تم إنشاء 1 تقييم');

  // ==================== Settings ====================
  console.log('⚙️ إنشاء الإعدادات...');

  const settings = [
    { key: 'site_name', value: 'ضيف', type: 'string', category: 'general', public: true },
    { key: 'site_description', value: 'منصة سياحية سورية شاملة', type: 'string', category: 'general', public: true },
    { key: 'default_currency', value: 'SYP', type: 'string', category: 'payment', public: true },
    { key: 'service_fee_percent', value: '12', type: 'number', category: 'payment', public: true },
    { key: 'tax_percent', value: '5', type: 'number', category: 'payment', public: true },
    { key: 'min_booking_hours', value: '24', type: 'number', category: 'booking', public: true },
    { key: 'max_listing_images', value: '10', type: 'number', category: 'listing', public: true },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ تم إنشاء الإعدادات');

  // ==================== Notification Templates ====================
  console.log('📧 إنشاء قوالب الإشعارات...');

  const templates = [
    {
      type: 'booking_confirmed',
      title: 'تم تأكيد حجزك',
      subject: 'تأكيد الحجز - ضيف',
      body: 'مرحباً {{guestName}}، تم تأكيد حجزك في {{listingTitle}} من {{checkIn}} إلى {{checkOut}}.',
    },
    {
      type: 'booking_cancelled',
      title: 'تم إلغاء الحجز',
      subject: 'إلغاء الحجز - ضيف',
      body: 'مرحباً {{guestName}}، نأسف لإعلامك بإلغاء حجزك في {{listingTitle}}.',
    },
    {
      type: 'new_review',
      title: 'تقييم جديد',
      subject: 'تقييم جديد - ضيف',
      body: 'مرحباً {{hostName}}، حصلت على تقييم جديد من {{guestName}} بتقييم {{rating}} نجوم.',
    },
    {
      type: 'payment_received',
      title: 'تم استلام الدفع',
      subject: 'تأكيد الدفع - ضيف',
      body: 'مرحباً {{userName}}، تم استلام دفعتك بقيمة {{amount}} {{currency}}.',
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { type: template.type },
      update: template,
      create: template,
    });
  }

  console.log('✅ تم إنشاء قوالب الإشعارات');

  console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
  console.log('\n📊 الملخص:');
  console.log('   - 5 مستخدمين (1 أدمن، 3 مضيفين، 1 ضيف)');
  console.log('   - 5 إقامات في 4 مدن سورية');
  console.log('   - 2 حجز تجريبي');
  console.log('   - 1 تقييم');
  console.log('   - 7 إعدادات');
  console.log('   - 4 قوالب إشعارات');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
