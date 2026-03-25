/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Providers - مزودي الذكاء الاصطناعي
 * 
 * @module infrastructure/providers/ai
 */

export * from './zai-ai.provider';

import { IAIProvider } from '@/core/interfaces/providers/ai.provider';
import { ZaiAIProvider } from './zai-ai.provider';

// ==================== Types ====================

export type AIProviderType = 'zai' | 'openai' | 'anthropic';

export interface AIConfig {
  type: AIProviderType;
  openai?: {
    apiKey: string;
    organization?: string;
  };
  anthropic?: {
    apiKey: string;
  };
}

// ==================== Factory ====================

/**
 * إنشاء مزود الذكاء الاصطناعي المناسب
 */
export function createAIProvider(config: AIConfig): IAIProvider {
  switch (config.type) {
    case 'zai':
      return new ZaiAIProvider();

    case 'openai':
      // TODO: Implement OpenAI provider
      throw new Error('OpenAI provider not yet implemented');

    case 'anthropic':
      // TODO: Implement Anthropic provider
      throw new Error('Anthropic provider not yet implemented');

    default:
      throw new Error(`Unknown AI provider type: ${config.type}`);
  }
}

// ==================== Singleton Instance ====================

let aiInstance: IAIProvider | null = null;

/**
 * تهيئة مزود الذكاء الاصطناعي
 */
export async function initializeAI(config: AIConfig): Promise<IAIProvider> {
  aiInstance = createAIProvider(config);
  
  // Initialize if needed
  if ('initialize' in aiInstance) {
    await (aiInstance as ZaiAIProvider).initialize();
  }
  
  return aiInstance;
}

/**
 * الحصول على مزود الذكاء الاصطناعي
 */
export function getAIProvider(): IAIProvider {
  if (!aiInstance) {
    throw new Error('AI provider not initialized. Call initializeAI() first.');
  }
  return aiInstance;
}
