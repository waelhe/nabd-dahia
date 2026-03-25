/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs - كائنات نقل البيانات
 * 
 * @module core/domain/dtos
 */

// Base DTOs
export {
  BaseEntityDTO,
  CreateEntityDTO,
  UpdateEntityDTO,
  FindByIdDTO,
  FindByIdsDTO,
  TimestampedDTO,
  VersionedDTO,
  TranslatableDTO,
  SoftDeleteDTO,
  RestoreDTO,
  DateRangeFilterDTO,
  TextFilterDTO,
  OrderByDTO as BaseOrderByDTO,
  UserReferenceDTO,
  UserSummaryDTO,
  CompanyReferenceDTO,
  LocationDTO,
  LocationSummaryDTO,
  MoneyDTO,
  MoneyFormattedDTO,
  RatingDTO,
  RatingSummaryDTO,
  ContactDTO,
  StatusDTO,
  SuccessResponseDTO,
  ErrorResponseDTO,
  ApiResponseDTO,
  MessageResponseDTO,
  BatchOperationDTO,
  BatchResultDTO,
  ExportDTO,
  ExportResultDTO,
} from './base.dto';

// Pagination DTOs
export {
  PaginationRequestDTO,
  OrderByDTO,
  AdvancedPaginationRequestDTO,
  FilterDTO,
  FilterOperator,
  PaginationResponseDTO,
  PaginationMetaDTO,
  PaginationLinksDTO,
  CursorPaginationRequestDTO,
  CursorPaginationResponseDTO,
  InfiniteScrollRequestDTO,
  InfiniteScrollResponseDTO,
  calculatePaginationMeta,
  validatePaginationRequest,
  calculateOffset,
  createPaginationLinks,
  toPrismaPagination,
  toPrismaOrderBy,
} from './pagination.dto';
