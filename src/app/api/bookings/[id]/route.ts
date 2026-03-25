/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Booking by ID API Endpoint
 * 
 * نقطة نهاية API لحجز محدد - باستخدام Use Cases
 * 
 * @route GET /api/bookings/[id] - الحصول على حجز
 * @route PUT /api/bookings/[id] - تحديث حجز
 * @route DELETE /api/bookings/[id] - إلغاء حجز
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getBooking,
  updateBooking,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  checkIn,
  checkOut,
} from '@/application/bookings/use-cases';
import {
  successResponse,
  noContentResponse,
  errorResponse,
} from '@/lib/api-response';

// ==================== GET - Get Booking ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    const result = await getBooking(id);
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'الحجز غير موجود', 404);
    }
    
    const booking = result.value;
    
    // Check access
    const isGuest = booking.guestId === user.id;
    const isHost = booking.hostId === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    
    if (!isGuest && !isHost && !isAdmin) {
      return errorResponse('FORBIDDEN', 'ليس لديك صلاحية للوصول لهذا الحجز', 403);
    }
    
    return successResponse(booking);
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الحجز', 500);
  }
}

// ==================== PUT - Update Booking ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    const body = await request.json();
    const action = body.action;
    
    // Handle actions
    switch (action) {
      case 'confirm': {
        const result = await confirmBooking(id, user.id);
        
        if (result.isErr()) {
          if (result.error.message.includes('Unauthorized')) {
            return errorResponse('FORBIDDEN', 'فقط المضيف يمكنه تأكيد الحجز', 403);
          }
          if (result.error.message.includes('cannot be confirmed')) {
            return errorResponse('INVALID_ACTION', 'لا يمكن تأكيد هذا الحجز', 400);
          }
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse({ ...result.value, message: 'تم تأكيد الحجز' });
      }
        
      case 'reject': {
        const result = await rejectBooking(id, user.id, body.reason);
        
        if (result.isErr()) {
          if (result.error.message.includes('Unauthorized')) {
            return errorResponse('FORBIDDEN', 'فقط المضيف يمكنه رفض الحجز', 403);
          }
          if (result.error.message.includes('cannot be rejected')) {
            return errorResponse('INVALID_ACTION', 'لا يمكن رفض هذا الحجز', 400);
          }
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse({ ...result.value, message: 'تم رفض الحجز' });
      }
        
      case 'cancel': {
        const result = await cancelBooking(id, user.id, body.reason);
        
        if (result.isErr()) {
          if (result.error.message.includes('Unauthorized')) {
            return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لإلغاء هذا الحجز', 403);
          }
          if (result.error.message.includes('cannot be cancelled')) {
            return errorResponse('INVALID_ACTION', 'لا يمكن إلغاء هذا الحجز', 400);
          }
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse({ ...result.value, message: 'تم إلغاء الحجز' });
      }
        
      case 'check-in': {
        const result = await checkIn(id, user.id);
        
        if (result.isErr()) {
          if (result.error.message.includes('Unauthorized')) {
            return errorResponse('FORBIDDEN', 'فقط المضيف يمكنه تسجيل الوصول', 403);
          }
          if (result.error.message.includes('cannot be checked in')) {
            return errorResponse('INVALID_ACTION', 'لا يمكن تسجيل الوصول لهذا الحجز', 400);
          }
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse({ ...result.value, message: 'تم تسجيل الوصول' });
      }
        
      case 'check-out': {
        const result = await checkOut(id, user.id);
        
        if (result.isErr()) {
          if (result.error.message.includes('Unauthorized')) {
            return errorResponse('FORBIDDEN', 'فقط المضيف يمكنه تسجيل المغادرة', 403);
          }
          if (result.error.message.includes('cannot be checked out')) {
            return errorResponse('INVALID_ACTION', 'لا يمكن تسجيل المغادرة لهذا الحجز', 400);
          }
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse({ ...result.value, message: 'تم تسجيل المغادرة' });
      }
        
      default: {
        // General update
        const result = await updateBooking(id, {
          guests: body.guests,
          adults: body.adults,
          children: body.children,
          infants: body.infants,
          guestNotes: body.guestNotes,
          specialRequests: body.specialRequests,
        });
        
        if (result.isErr()) {
          return errorResponse('INTERNAL_ERROR', result.error.message, 500);
        }
        
        return successResponse(result.value);
      }
    }
    
  } catch (error) {
    console.error('Error updating booking:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الحجز', 500);
  }
}

// ==================== DELETE - Cancel Booking ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    const result = await cancelBooking(id, user.id, 'تم الإلغاء من قبل المستخدم');
    
    if (result.isErr()) {
      if (result.error.message.includes('not found')) {
        return errorResponse('NOT_FOUND', 'الحجز غير موجود', 404);
      }
      if (result.error.message.includes('Unauthorized')) {
        return errorResponse('FORBIDDEN', 'ليس لديك صلاحية لإلغاء هذا الحجز', 403);
      }
      if (result.error.message.includes('cannot be cancelled')) {
        return errorResponse('INVALID_ACTION', 'لا يمكن إلغاء هذا الحجز', 400);
      }
      return errorResponse('INTERNAL_ERROR', result.error.message, 500);
    }
    
    return noContentResponse();
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء إلغاء الحجز', 500);
  }
}
