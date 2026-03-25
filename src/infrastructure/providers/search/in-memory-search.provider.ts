/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * In-Memory Search Provider - مزود البحث في الذاكرة
 * 
 * @module infrastructure/providers/search/in-memory-search.provider
 */

import {
  ISearchProvider,
  SearchRequest,
  SearchResult,
  SearchHit,
  SearchDocument,
  IndexDefinition,
  IndexStats,
  IndexSettings,
  BatchDocumentsResult,
  SearchSuggestion,
  SearchFilter,
} from '@/core/interfaces/providers/search.provider';
import { Result, ok, err } from '@/core/types/result';

// ==================== Types ====================

interface SearchIndex {
  name: string;
  documents: Map<string, SearchDocument>;
  settings: IndexSettings;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== In-Memory Search Provider ====================

/**
 * مزود البحث في الذاكرة - للتطوير والاختبار
 */
export class InMemorySearchProvider implements ISearchProvider {
  private readonly indexes: Map<string, SearchIndex> = new Map();
  private readonly searchHistory: Map<string, string[]> = new Map();
  private readonly stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'و', 'في', 'من', 'على', 'إلى',
    'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'كان', 'كانت',
  ]);

  // ==================== Index Management ====================

  async createIndex(definition: IndexDefinition): Promise<Result<void, Error>> {
    if (this.indexes.has(definition.name)) {
      return err(new Error(`Index ${definition.name} already exists`));
    }

    const index: SearchIndex = {
      name: definition.name,
      documents: new Map(),
      settings: {
        searchableFields: definition.searchableFields,
        filterableFields: definition.filterableFields,
        sortableFields: definition.sortableFields,
        facetedFields: definition.facetedFields,
        stopWords: definition.stopWords,
        synonyms: definition.synonyms,
        rankingRules: definition.rankingRules,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.indexes.set(definition.name, index);
    return ok(undefined);
  }

  async deleteIndex(name: string): Promise<Result<void, Error>> {
    if (!this.indexes.has(name)) {
      return err(new Error(`Index ${name} not found`));
    }
    this.indexes.delete(name);
    return ok(undefined);
  }

  async listIndexes(): Promise<string[]> {
    return Array.from(this.indexes.keys());
  }

  async getIndexStats(name: string): Promise<Result<IndexStats, Error>> {
    const index = this.indexes.get(name);
    if (!index) {
      return err(new Error(`Index ${name} not found`));
    }

    const fieldDistribution: Record<string, number> = {};
    for (const doc of index.documents.values()) {
      for (const field of Object.keys(doc)) {
        fieldDistribution[field] = (fieldDistribution[field] || 0) + 1;
      }
    }

    return ok({
      numberOfDocuments: index.documents.size,
      isIndexing: false,
      fieldDistribution,
      createdAt: index.createdAt,
      updatedAt: index.updatedAt,
      databaseSize: 0,
      lastUpdate: index.updatedAt,
    });
  }

  async updateIndexSettings(
    name: string,
    settings: IndexSettings,
  ): Promise<Result<void, Error>> {
    const index = this.indexes.get(name);
    if (!index) {
      return err(new Error(`Index ${name} not found`));
    }

    index.settings = { ...index.settings, ...settings };
    index.updatedAt = new Date();
    return ok(undefined);
  }

  async getIndexSettings(name: string): Promise<Result<IndexSettings, Error>> {
    const index = this.indexes.get(name);
    if (!index) {
      return err(new Error(`Index ${name} not found`));
    }
    return ok(index.settings);
  }

  // ==================== Document Operations ====================

  async addDocument<T extends SearchDocument>(
    index: string,
    document: T,
  ): Promise<Result<BatchDocumentsResult, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    idx.documents.set(document.id, document);
    idx.updatedAt = new Date();

    return ok({
      status: 'processed',
      success: 1,
      failed: 0,
    });
  }

  async addDocuments<T extends SearchDocument>(
    index: string,
    documents: T[],
  ): Promise<Result<BatchDocumentsResult, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    let success = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const doc of documents) {
      try {
        idx.documents.set(doc.id, doc);
        success++;
      } catch (error) {
        errors.push({
          id: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    idx.updatedAt = new Date();

    return ok({
      status: 'processed',
      success,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  async updateDocument<T extends SearchDocument>(
    index: string,
    document: T,
  ): Promise<Result<BatchDocumentsResult, Error>> {
    return this.addDocument(index, document);
  }

  async updateDocuments<T extends SearchDocument>(
    index: string,
    documents: T[],
  ): Promise<Result<BatchDocumentsResult, Error>> {
    return this.addDocuments(index, documents);
  }

  async deleteDocument(index: string, documentId: string): Promise<Result<void, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    if (!idx.documents.has(documentId)) {
      return err(new Error(`Document ${documentId} not found`));
    }

    idx.documents.delete(documentId);
    idx.updatedAt = new Date();
    return ok(undefined);
  }

  async deleteDocuments(index: string, documentIds: string[]): Promise<Result<void, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    for (const id of documentIds) {
      idx.documents.delete(id);
    }
    idx.updatedAt = new Date();
    return ok(undefined);
  }

  async deleteAllDocuments(index: string): Promise<Result<void, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    idx.documents.clear();
    idx.updatedAt = new Date();
    return ok(undefined);
  }

  async getDocument<T>(index: string, documentId: string): Promise<Result<T, Error>> {
    const idx = this.indexes.get(index);
    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    const doc = idx.documents.get(documentId);
    if (!doc) {
      return err(new Error(`Document ${documentId} not found`));
    }

    return ok(doc as T);
  }

  async getDocumentsCount(index: string): Promise<number> {
    const idx = this.indexes.get(index);
    return idx?.documents.size || 0;
  }

  // ==================== Search Operations ====================

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 0 && !this.stopWords.has(token));
  }

  private calculateScore(queryTokens: string[], document: SearchDocument): number {
    let score = 0;
    const searchableFields = ['name', 'title', 'description', 'content', 'address', 'city'];

    for (const field of searchableFields) {
      const value = document[field];
      if (typeof value === 'string') {
        const docTokens = this.tokenize(value);
        for (const queryToken of queryTokens) {
          for (const docToken of docTokens) {
            if (docToken.includes(queryToken) || queryToken.includes(docToken)) {
              score += 1;
            }
            if (docToken === queryToken) {
              score += 2; // Exact match bonus
            }
          }
        }
      }
    }

    return score;
  }

  private matchesFilter(document: SearchDocument, filter?: SearchFilter): boolean {
    if (!filter) return true;

    // Check where conditions
    if (filter.where) {
      for (const [field, value] of Object.entries(filter.where)) {
        const docValue = document[field];
        if (Array.isArray(value)) {
          if (!value.includes(docValue)) return false;
        } else if (docValue !== value) {
          return false;
        }
      }
    }

    // Check range conditions
    if (filter.range) {
      for (const [field, range] of Object.entries(filter.range)) {
        const docValue = document[field];
        if (typeof docValue === 'number') {
          if (range.min !== undefined && docValue < range.min) return false;
          if (range.max !== undefined && docValue > range.max) return false;
        }
      }
    }

    // Check exists conditions
    if (filter.exists) {
      for (const field of filter.exists) {
        if (document[field] === undefined) return false;
      }
    }

    // Check missing conditions
    if (filter.missing) {
      for (const field of filter.missing) {
        if (document[field] !== undefined) return false;
      }
    }

    return true;
  }

  async search<T>(index: string, request: SearchRequest): Promise<Result<SearchResult<T>, Error>> {
    const startTime = Date.now();
    const idx = this.indexes.get(index);

    if (!idx) {
      return err(new Error(`Index ${index} not found`));
    }

    const queryTokens = this.tokenize(request.query);
    const page = request.page || 1;
    const limit = request.limit || 20;

    // Score and filter documents
    let hits: SearchHit<T>[] = [];
    for (const doc of idx.documents.values()) {
      if (!this.matchesFilter(doc, request.filter)) continue;

      const score = this.calculateScore(queryTokens, doc);
      if (score > 0) {
        hits.push({
          id: doc.id,
          document: doc as T,
          score,
        });
      }
    }

    // Sort by score (descending)
    hits.sort((a, b) => b.score - a.score);

    // Apply pagination
    const total = hits.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    hits = hits.slice(offset, offset + limit);

    // Save search history for suggestions
    const history = this.searchHistory.get(index) || [];
    history.unshift(request.query);
    this.searchHistory.set(index, history.slice(0, 100));

    return ok({
      hits,
      total,
      page,
      limit,
      totalPages,
      processingTime: Date.now() - startTime,
      query: request.query,
    });
  }

  async multiSearch(
    requests: Array<{ index: string; request: SearchRequest }>,
  ): Promise<Result<SearchResult[], Error>> {
    const results: SearchResult[] = [];

    for (const { index, request } of requests) {
      const result = await this.search(index, request);
      if (result.isErr()) {
        return err(result.error);
      }
      results.push(result.value);
    }

    return ok(results);
  }

  async getSuggestions(
    index: string,
    query: string,
    limit?: number,
  ): Promise<SearchSuggestion[]> {
    const history = this.searchHistory.get(index) || [];
    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    for (const term of history) {
      if (term.toLowerCase().includes(lowerQuery) && term !== query) {
        suggestions.push({
          text: term,
          score: 1 - (suggestions.length * 0.1),
          type: 'history',
        });
      }
      if (suggestions.length >= (limit || 5)) break;
    }

    return suggestions;
  }

  async instantSearch(
    index: string,
    query: string,
    options?: { limit?: number; fields?: string[] },
  ): Promise<SearchHit[]> {
    const result = await this.search(index, {
      query,
      limit: options?.limit || 10,
    });

    if (result.isErr()) {
      return [];
    }

    return result.value.hits;
  }

  // ==================== Bulk Operations ====================

  async reindex(index: string): Promise<Result<{ taskUid: number; status: string }, Error>> {
    // In-memory doesn't need reindexing
    return ok({ taskUid: Date.now(), status: 'succeeded' });
  }

  async getTaskStatus(taskUid: number): Promise<Result<{
    status: 'enqueued' | 'processing' | 'succeeded' | 'failed';
    progress?: number;
    error?: string;
  }, Error>> {
    return ok({ status: 'succeeded' });
  }

  async waitForTask(taskUid: number, timeout?: number): Promise<Result<void, Error>> {
    return ok(undefined);
  }

  // ==================== Health ====================

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }

  async health(): Promise<{
    status: 'available' | 'degraded' | 'unavailable';
    version?: string;
    uptime?: number;
  }> {
    return {
      status: 'available',
      version: '1.0.0-in-memory',
      uptime: process.uptime(),
    };
  }
}
