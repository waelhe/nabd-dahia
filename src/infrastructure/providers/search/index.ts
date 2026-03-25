/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Search Providers - مزودي البحث
 * 
 * @module infrastructure/providers/search
 */

export * from './in-memory-search.provider';

import { ISearchProvider } from '@/core/interfaces/providers/search.provider';
import { InMemorySearchProvider } from './in-memory-search.provider';

// ==================== Types ====================

export type SearchProviderType = 'in-memory' | 'meilisearch' | 'elasticsearch';

export interface SearchConfig {
  type: SearchProviderType;
  meilisearch?: {
    host: string;
    apiKey: string;
  };
  elasticsearch?: {
    node: string;
    auth?: {
      username: string;
      password: string;
    };
  };
}

// ==================== Factory ====================

/**
 * إنشاء مزود البحث المناسب
 */
export function createSearchProvider(config: SearchConfig): ISearchProvider {
  switch (config.type) {
    case 'in-memory':
      return new InMemorySearchProvider();

    case 'meilisearch':
      // TODO: Implement MeiliSearch provider
      throw new Error('MeiliSearch provider not yet implemented');

    case 'elasticsearch':
      // TODO: Implement Elasticsearch provider
      throw new Error('Elasticsearch provider not yet implemented');

    default:
      throw new Error(`Unknown search provider type: ${config.type}`);
  }
}

// ==================== Singleton Instance ====================

let searchInstance: ISearchProvider | null = null;

/**
 * تهيئة مزود البحث
 */
export function initializeSearch(config: SearchConfig): ISearchProvider {
  searchInstance = createSearchProvider(config);
  return searchInstance;
}

/**
 * الحصول على مزود البحث
 */
export function getSearchProvider(): ISearchProvider {
  if (!searchInstance) {
    throw new Error('Search provider not initialized. Call initializeSearch() first.');
  }
  return searchInstance;
}
