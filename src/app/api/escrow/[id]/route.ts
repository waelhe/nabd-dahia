/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Escrow API Endpoint
 * 
 * نقطة نهاية API لضمان واحد
 * 
 * @route GET /api/escrow/[id] - تفاصيل الضمان
 * @route PATCH /api/escrow/[id] - تحديث الضمان
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getEscrow,
  getEscrowTimeline,
  releaseToHost,
  releaseToGuest,
  releaseSplit,
  openDispute,
  resolveDispute,
} from '@/application/escrow/use-cases';

// ==================== GET - Escrow Details ====================

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
    
    // Check if requesting timeline
    const url = new URL(request.url);
    if (url.searchParams.get('timeline') === 'true') {
      const result = await getEscrowTimeline(id);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الجدول الزمني', 500);
      }
      
      return successResponse(result.value);
    }
    
    const result = await getEscrow(id);
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'الضمان غير موجود', 404);
    }
    
    return successResponse(result.value);
    
  } catch (error) {
    console.error('Error fetching escrow:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الضمان', 500);
  }
}

// ==================== PATCH - Update Escrow ====================

export async function PATCH(
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
    
    // Handle different actions
    switch (body.action) {
      case 'releaseToHost': {
        // Admin or host can release to host
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          return errorResponse('FORBIDDEN', 'غير مصرح', 403);
        }
        
        const result = await releaseToHost(id, user.id, body.notes);
        
        if (result.isErr()) {
          return errorResponse('VALIDATION_ERROR', result.error.message, 400);
        }
        
        return successResponse({ message: 'تم الإفراج للمضيف' });
      }
      
      case 'releaseToGuest': {
        // Admin only
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          return errorResponse('FORBIDDEN', 'غير مصرح', 403);
        }
        
        const result = await releaseToGuest(id, user.id, body.notes);
        
        if (result.isErr()) {
          return errorResponse('VALIDATION_ERROR', result.error.message, 400);
        }
        
        return successResponse({ message: 'تم الإفراج للضيف' });
      }
      
      case 'releaseSplit': {
        // Admin only
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          return errorResponse('FORBIDDEN', 'غير مصرح', 403);
        }
        
        if (!body.hostAmount || !body.guestAmount) {
          return errorResponse('INVALID_INPUT', 'مبالغ المضيف والضيف مطلوبة', 400);
        }
        
        const result = await releaseSplit(
          id,
          body.hostAmount,
          body.guestAmount,
          user.id,
          body.notes
        );
        
        if (result.isErr()) {
          return errorResponse('VALIDATION_ERROR', result.error.message, 400);
        }
        
        return successResponse({ message: 'تم الإفراج المقسم' });
      }
      
      case 'openDispute': {
        if (!body.reason) {
          return errorResponse('INVALID_INPUT', 'سبب النزاع مطلوب', 400);
        }
        
        const result = await openDispute({
          escrowId: id,
          reason: body.reason,
          description: body.description,
          evidence: body.evidence,
          openedBy: body.openedBy || 'guest',
        });
        
        if (result.isErr()) {
          return errorResponse('VALIDATION_ERROR', result.error.message, 400);
        }
        
        return successResponse({ message: 'تم فتح النزاع' });
      }
      
      case 'resolveDispute': {
        // Admin only
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          return errorResponse('FORBIDDEN', 'غير مصرح', 403);
        }
        
        if (!body.hostAmount || !body.guestAmount) {
          return errorResponse('INVALID_INPUT', 'مبالغ التسوية مطلوبة', 400);
        }
        
        const result = await resolveDispute({
          escrowId: id,
          hostAmount: body.hostAmount,
          guestAmount: body.guestAmount,
          resolvedBy: user.id,
          notes: body.notes,
        });
        
        if (result.isErr()) {
          return errorResponse('VALIDATION_ERROR', result.error.message, 400);
        }
        
        return successResponse({ message: 'تم حل النزاع' });
      }
      
      default:
        return errorResponse('INVALID_INPUT', 'إجراء غير صالح', 400);
    }
    
  } catch (error) {
    console.error('Error updating escrow:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الضمان', 500);
  }
}
