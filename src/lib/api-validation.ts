/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Validation Schemas
 *
 * مخططات التحقق من صحة الطلبات
 *
 * @module lib/api-validation
 * @updated Force recompile
 */

import { z } from 'zod';

// ==================== Common Schemas ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idSchema = z.string().min(1, 'المعرف مطلوب');

export const emailSchema = z.string().email('البريد الإلكتروني غير صالح').optional().nullable();

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, 'رقم الهاتف غير صالح').optional().nullable();

export const passwordSchema = z.string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(100, 'كلمة المرور طويلة جداً');

// ==================== Auth Schemas ====================

export const registerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  firstName: z.string().min(2, 'الاسم الأول قصير جداً').max(50),
  lastName: z.string().min(2, 'الاسم الأخير قصير جداً').max(50),
}).refine(data => data.email || data.phone, {
  message: 'البريد الإلكتروني أو رقم الهاتف مطلوب',
  path: ['email'],
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'المعرف مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
});

// ==================== User Schemas ====================

export const createUserSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nationality: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  preferredLanguage: z.enum(['ar', 'en', 'fr', 'tr', 'ru']).optional(),
  preferredCurrency: z.enum(['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR']).optional(),
}).refine(data => data.email || data.phone, {
  message: 'البريد الإلكتروني أو رقم الهاتف مطلوب',
  path: ['email'],
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  displayName: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nationality: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  preferredLanguage: z.enum(['ar', 'en', 'fr', 'tr', 'ru']).optional(),
  preferredCurrency: z.enum(['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR']).optional(),
});

// ==================== Listing Schemas ====================

export const listingTypeSchema = z.enum([
  'apartment', 'house', 'villa', 'hotel', 'chalet',
  'camp', 'farm', 'room', 'office', 'shop', 'other'
]);

export const listingStatusSchema = z.enum([
  'draft', 'pending', 'active', 'inactive', 'archived'
]);

export const addressSchema = z.object({
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  neighborhood: z.string().max(100).optional(),
});

export const createListingSchema = z.object({
  hostId: z.string().min(1, 'معرف المضيف مطلوب'),
  companyId: z.string().optional(),
  title: z.string().min(3, 'العنوان قصير جداً').max(200),
  description: z.string().max(5000).optional(),
  type: listingTypeSchema,
  category: z.string().max(50).optional(),
  capacity: z.number().int().min(1).default(1),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  beds: z.number().int().min(0).optional(),
  size: z.number().positive().optional(),
  basePrice: z.number().nonnegative('السعر يجب أن يكون صفر أو أكثر'),
  currency: z.enum(['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR']).default('SYP'),
  cleaningFee: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  minNights: z.number().int().min(1).default(1),
  maxNights: z.number().int().min(1).optional(),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('14:00'),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('12:00'),
  instantBook: z.boolean().default(false),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']).default('moderate'),
  address: addressSchema,
  amenities: z.array(z.string()).optional(),
  houseRules: z.record(z.unknown()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().max(200).optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
});

export const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  type: listingTypeSchema.optional(),
  category: z.string().max(50).optional(),
  capacity: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  beds: z.number().int().min(0).optional(),
  size: z.number().positive().optional(),
  basePrice: z.number().nonnegative().optional(),
  currency: z.enum(['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR']).optional(),
  cleaningFee: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  minNights: z.number().int().min(1).optional(),
  maxNights: z.number().int().min(1).optional(),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  instantBook: z.boolean().optional(),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']).optional(),
  status: listingStatusSchema.optional(),
  address: addressSchema.optional(),
  amenities: z.array(z.string()).optional(),
  houseRules: z.record(z.unknown()).optional(),
});

// ==================== Booking Schemas ====================

export const bookingStatusSchema = z.enum([
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
]);

export const createBookingSchema = z.object({
  listingId: z.string().min(1, 'معرف الإقامة مطلوب'),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.number().int().min(1).default(1),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  guestNotes: z.string().max(1000).optional(),
  specialRequests: z.string().max(1000).optional(),
}).refine(data => data.checkIn < data.checkOut, {
  message: 'تاريخ الوصول يجب أن يكون قبل تاريخ المغادرة',
  path: ['checkIn'],
}).refine(data => data.checkIn >= new Date(), {
  message: 'تاريخ الوصول يجب أن يكون في المستقبل',
  path: ['checkIn'],
});

export const updateBookingSchema = z.object({
  guests: z.number().int().min(1).optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  guestNotes: z.string().max(1000).optional(),
  specialRequests: z.string().max(1000).optional(),
});

export const bookingActionSchema = z.object({
  action: z.enum(['confirm', 'reject', 'cancel', 'check-in', 'check-out']),
  reason: z.string().max(500).optional(),
});

// ==================== Review Schemas ====================

export const ratingSchema = z.number().int().min(1).max(5);

export const reviewCategoriesSchema = z.object({
  overall: ratingSchema,
  cleanliness: ratingSchema.optional(),
  communication: ratingSchema.optional(),
  location: ratingSchema.optional(),
  value: ratingSchema.optional(),
  checkIn: ratingSchema.optional(),
  accuracy: ratingSchema.optional(),
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'معرف الحجز مطلوب'),
  listingId: z.string().min(1, 'معرف الإقامة مطلوب'),
  revieweeId: z.string().min(1, 'معرف المضيف مطلوب'),
  ratings: reviewCategoriesSchema,
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  ratings: reviewCategoriesSchema.partial().optional(),
  comment: z.string().max(2000).optional(),
});

// ==================== Payment Schemas ====================

export const paymentMethodSchema = z.enum(['card', 'bank_transfer', 'wallet', 'cash', 'check']);

export const paymentTypeSchema = z.enum(['booking', 'deposit', 'refund', 'fee', 'payout', 'adjustment']);

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'معرف الحجز مطلوب'),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.enum(['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR']),
  type: paymentTypeSchema.default('booking'),
  method: paymentMethodSchema.optional(),
  idempotencyKey: z.string().optional(),
});

// ==================== Company Schemas ====================

export const companyTypeSchema = z.enum([
  'hotel', 'travel_agency', 'medical', 'education', 'business', 'other'
]);

export const createCompanySchema = z.object({
  name: z.string().min(2, 'اسم الشركة قصير جداً').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  type: companyTypeSchema,
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  registrationNumber: z.string().max(50).optional(),
  taxId: z.string().max(50).optional(),
  legalName: z.string().max(100).optional(),
  email: emailSchema,
  phone: phoneSchema,
  website: z.string().url().optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  ownerIds: z.array(z.string()).min(1, 'يجب تحديد مالك واحد على الأقل'),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  registrationNumber: z.string().max(50).optional(),
  taxId: z.string().max(50).optional(),
  legalName: z.string().max(100).optional(),
  email: emailSchema,
  phone: phoneSchema,
  website: z.string().url().optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ==================== Notification Schemas ====================

export const notificationTypeSchema = z.enum([
  'booking', 'payment', 'review', 'message', 'system', 'promotion', 'security', 'reminder', 'alert'
]);

export const notificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const notificationChannelSchema = z.enum(['email', 'sms', 'push', 'in_app']);

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  type: notificationTypeSchema,
  title: z.string().min(1, 'العنوان مطلوب').max(200),
  message: z.string().min(1, 'الرسالة مطلوبة').max(2000),
  data: z.record(z.unknown()).optional(),
  actionUrl: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  channels: z.array(notificationChannelSchema).default(['in_app']),
  priority: notificationPrioritySchema.default('normal'),
  maxRetries: z.number().int().min(1).max(10).default(3),
  expiresAt: z.coerce.date().optional(),
});

// ==================== Helper Functions ====================

/**
 * التحقق من صحة البيانات
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * تنسيق أخطاء التحقق
 */
export function formatValidationErrors(error: z.ZodError): Array<{
  path: string;
  message: string;
}> {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message,
  }));
}
