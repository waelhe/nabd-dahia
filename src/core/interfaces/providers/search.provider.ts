/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Search Provider Interface - واجهة مزود البحث
 * 
 * @module core/interfaces/providers/search.provider
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * طلب البحث
 */
export interface SearchRequest {
  query: string;
  filter?: SearchFilter;
  facets?: string[];
  sort?: SortOption[];
  page?: number;
  limit?: number;
  highlight?: boolean;
  highlightTag?: { pre: string; post: string };
}

/**
 * فلاتر البحث
 */
export interface SearchFilter {
  where?: Record<string, FilterValue>;
  range?: Record<string, { min?: number | string; max?: number | string }>;
  exists?: string[];
  missing?: string[];
}

/**
 * قيمة الفلتر
 */
export type FilterValue = string | number | boolean | string[] | number[];

/**
 * خيار الترتيب
 */
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * نتيجة البحث
 */
export interface SearchResult<T = Record<string, unknown>> {
  hits: SearchHit<T>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  processingTime: number;
  query: string;
  facets?: Record<string, FacetResult>;
}

/**
 * عنصر البحث
 */
export interface SearchHit<T = Record<string, unknown>> {
  id: string;
  document: T;
  score: number;
  highlight?: Record<string, string[]>;
  fragments?: Record<string, string[]>;
}

/**
 * نتيجة الـ Facet
 */
export interface FacetResult {
  name: string;
  values: Array<{
    value: string;
    count: number;
    selected?: boolean;
  }>;
}

/**
 * مستند البحث
 */
export interface SearchDocument {
  id: string;
  [key: string]: unknown;
}

/**
 * تعريف الفهرس
 */
export interface IndexDefinition {
  name: string;
  primaryKey?: string;
  searchableFields?: string[];
  filterableFields?: string[];
  sortableFields?: string[];
  facetedFields?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  rankingRules?: string[];
}

/**
 * إحصائيات الفهرس
 */
export interface IndexStats {
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
  databaseSize: number;
  lastUpdate: Date;
}

/**
 * إعدادات الفهرس
 */
export interface IndexSettings {
  searchableFields?: string[];
  filterableFields?: string[];
  sortableFields?: string[];
  facetedFields?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  rankingRules?: string[];
  distinctAttribute?: string;
  typoTolerance?: {
    enabled: boolean;
    minWordSizeForTypos?: {
      oneTypo?: number;
      twoTypos?: number;
    };
    disableOnWords?: string[];
    disableOnAttributes?: string[];
  };
}

/**
 * مستندات متعددة
 */
export interface BatchDocumentsResult {
  status: 'enqueued' | 'processed' | 'failed';
  taskUid?: number;
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * اقتراح البحث
 */
export interface SearchSuggestion {
  text: string;
  score: number;
  type?: 'completion' | 'correction' | 'history';
}

// ==================== Provider Interface ====================

/**
 * واجهة مزود البحث
 */
export interface ISearchProvider {
  // ==================== Index Management ====================

  /**
   * إنشاء فهرس
   */
  createIndex(definition: IndexDefinition): Promise<Result<void, Error>>;

  /**
   * حذف فهرس
   */
  deleteIndex(name: string): Promise<Result<void, Error>>;

  /**
   * الفهارس
   */
  listIndexes(): Promise<string[]>;

  /**
   * إحصائيات الفهرس
   */
  getIndexStats(name: string): Promise<Result<IndexStats, Error>>;

  /**
   * تحديث إعدادات الفهرس
   */
  updateIndexSettings(name: string, settings: IndexSettings): Promise<Result<void, Error>>;

  /**
   * الحصول على إعدادات الفهرس
   */
  getIndexSettings(name: string): Promise<Result<IndexSettings, Error>>;

  // ==================== Document Operations ====================

  /**
   * إضافة مستند
   */
  addDocument<T extends SearchDocument>(index: string, document: T): Promise<Result<BatchDocumentsResult, Error>>;

  /**
   * إضافة مستندات
   */
  addDocuments<T extends SearchDocument>(index: string, documents: T[]): Promise<Result<BatchDocumentsResult, Error>>;

  /**
   * تحديث مستند
   */
  updateDocument<T extends SearchDocument>(index: string, document: T): Promise<Result<BatchDocumentsResult, Error>>;

  /**
   * تحديث مستندات
   */
  updateDocuments<T extends SearchDocument>(index: string, documents: T[]): Promise<Result<BatchDocumentsResult, Error>>;

  /**
   * حذف مستند
   */
  deleteDocument(index: string, documentId: string): Promise<Result<void, Error>>;

  /**
   * حذف مستندات
   */
  deleteDocuments(index: string, documentIds: string[]): Promise<Result<void, Error>>;

  /**
   * حذف جميع المستندات
   */
  deleteAllDocuments(index: string): Promise<Result<void, Error>>;

  /**
   * الحصول على مستند
   */
  getDocument<T>(index: string, documentId: string): Promise<Result<T, Error>>;

  /**
   * عدد المستندات
   */
  getDocumentsCount(index: string): Promise<number>;

  // ==================== Search Operations ====================

  /**
   * البحث
   */
  search<T>(index: string, request: SearchRequest): Promise<Result<SearchResult<T>, Error>>;

  /**
   * البحث في عدة فهارس
   */
  multiSearch(requests: Array<{ index: string; request: SearchRequest }>): Promise<Result<SearchResult[], Error>>;

  /**
   * اقتراحات البحث
   */
  getSuggestions(index: string, query: string, limit?: number): Promise<SearchSuggestion[]>;

  /**
   * البحث المباشر
   */
  instantSearch(index: string, query: string, options?: { limit?: number; fields?: string[] }): Promise<SearchHit[]>;

  // ==================== Bulk Operations ====================

  /**
   * إعادة فهرسة
   */
  reindex(index: string): Promise<Result<{ taskUid: number; status: string }, Error>>;

  /**
   * حالة المهمة
   */
  getTaskStatus(taskUid: number): Promise<Result<{
    status: 'enqueued' | 'processing' | 'succeeded' | 'failed';
    progress?: number;
    error?: string;
  }, Error>>;

  /**
   * انتظار المهمة
   */
  waitForTask(taskUid: number, timeout?: number): Promise<Result<void, Error>>;

  // ==================== Health ====================

  /**
   * اختبار الاتصال
   */
  testConnection(): Promise<Result<boolean, Error>>;

  /**
   * صحة النظام
   */
  health(): Promise<{
    status: 'available' | 'degraded' | 'unavailable';
    version?: string;
    uptime?: number;
  }>;
}
