/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Company API Endpoint
 * 
 * نقطة نهاية API لشركة واحدة
 * 
 * @route GET /api/companies/[id] - تفاصيل الشركة
 * @route PATCH /api/companies/[id] - تحديث الشركة
 * @route DELETE /api/companies/[id] - حذف الشركة
 */

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import {
  getCompany,
  getCompanyBySlug,
  updateCompany,
  deleteCompany,
  verifyCompany,
  getCompanyEmployees,
  addCompanyEmployee,
  removeCompanyEmployee,
  isCompanyEmployee,
} from '@/application/companies/use-cases';

// ==================== GET - Company Details ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if requesting employees
    const url = new URL(request.url);
    if (url.searchParams.get('employees') === 'true') {
      const result = await getCompanyEmployees(id);
      
      if (result.isErr()) {
        return errorResponse('INTERNAL_ERROR', 'فشل في جلب الموظفين', 500);
      }
      
      return successResponse(result.value);
    }
    
    // Try to get by ID or slug
    let result;
    if (id.startsWith('cl') || id.length === 25) {
      // Looks like a CUID, try by ID
      result = await getCompany(id);
    } else {
      // Try by slug
      result = await getCompanyBySlug(id);
    }
    
    if (result.isErr()) {
      return errorResponse('NOT_FOUND', 'الشركة غير موجودة', 404);
    }
    
    return successResponse(result.value);
    
  } catch (error) {
    console.error('Error fetching company:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء جلب الشركة', 500);
  }
}

// ==================== PATCH - Update Company ====================

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
    
    // Check if user is employee
    const isEmployee = await isCompanyEmployee(id, user.id);
    if (!isEmployee && user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'غير مصرح بالتعديل', 403);
    }
    
    // Handle verify action (admin only)
    if (body.action === 'verify') {
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return errorResponse('FORBIDDEN', 'غير مصرح بالتحقق', 403);
      }
      
      const result = await verifyCompany(id, user.id);
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم التحقق من الشركة' });
    }
    
    // Handle add employee
    if (body.action === 'addEmployee') {
      if (!body.userId || !body.role) {
        return errorResponse('INVALID_INPUT', 'معرف المستخدم والدور مطلوبان', 400);
      }
      
      const result = await addCompanyEmployee({
        companyId: id,
        userId: body.userId,
        role: body.role,
        permissions: body.permissions,
      });
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم إضافة الموظف' });
    }
    
    // Handle remove employee
    if (body.action === 'removeEmployee') {
      if (!body.userId) {
        return errorResponse('INVALID_INPUT', 'معرف المستخدم مطلوب', 400);
      }
      
      const result = await removeCompanyEmployee(id, body.userId);
      
      if (result.isErr()) {
        return errorResponse('VALIDATION_ERROR', result.error.message, 400);
      }
      
      return successResponse({ message: 'تم إزالة الموظف' });
    }
    
    // Update company
    const result = await updateCompany(id, {
      name: body.name,
      description: body.description,
      logo: body.logo,
      coverImage: body.coverImage,
      email: body.email,
      phone: body.phone,
      website: body.website,
      address: body.address,
      registrationNumber: body.registrationNumber,
      taxId: body.taxId,
      status: body.status,
    });
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse(result.value);
    
  } catch (error) {
    console.error('Error updating company:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء تحديث الشركة', 500);
  }
}

// ==================== DELETE - Delete Company ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'يجب تسجيل الدخول', 401);
    }
    
    const { id } = await params;
    
    // Check if user is employee
    const isEmployee = await isCompanyEmployee(id, user.id);
    if (!isEmployee && user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse('FORBIDDEN', 'غير مصرح بالحذف', 403);
    }
    
    const result = await deleteCompany(id);
    
    if (result.isErr()) {
      return errorResponse('VALIDATION_ERROR', result.error.message, 400);
    }
    
    return successResponse({ message: 'تم حذف الشركة' });
    
  } catch (error) {
    console.error('Error deleting company:', error);
    return errorResponse('INTERNAL_ERROR', 'حدث خطأ أثناء حذف الشركة', 500);
  }
}
