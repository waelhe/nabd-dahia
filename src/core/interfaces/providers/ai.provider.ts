/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Provider Interface - واجهة مزود الذكاء الاصطناعي
 * 
 * @module core/interfaces/providers/ai.provider
 */

import type { Result } from '../../types/result';

// ==================== Types ====================

/**
 * نموذج AI
 */
export type AIModel = 'gemini-pro' | 'gemini-pro-vision' | 'gemini-ultra' | string;

/**
 * دور الرسالة
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * الرسالة
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  images?: string[]; // URLs or base64
}

/**
 * طلب المحادثة
 */
export interface ChatRequest {
  messages: ChatMessage[];
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  safetySettings?: SafetySetting[];
  systemPrompt?: string;
  context?: string;
  responseFormat?: 'text' | 'json';
  tools?: AITool[];
  toolChoice?: 'auto' | 'none' | { function: { name: string } };
}

/**
 * إعدادات الأمان
 */
export interface SafetySetting {
  category: 'harmful_content' | 'hate_speech' | 'sexual_content' | 'dangerous_content' | 'harassment';
  threshold: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high' | 'block_none';
}

/**
 * نتيجة المحادثة
 */
export interface ChatResponse {
  id: string;
  model: AIModel;
  content: string;
  role: MessageRole;
  finishReason: 'stop' | 'length' | 'safety' | 'tool_calls' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  safetyRatings?: SafetyRating[];
  toolCalls?: ToolCall[];
}

/**
 * تقييم الأمان
 */
export interface SafetyRating {
  category: string;
  probability: 'negligible' | 'low' | 'medium' | 'high';
  blocked?: boolean;
}

/**
 * استدعاء أداة
 */
export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

/**
 * أداة AI
 */
export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * طلب التوليد
 */
export interface GenerateRequest {
  prompt: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

/**
 * نتيجة التوليد
 */
export interface GenerateResponse {
  id: string;
  model: AIModel;
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * طلب التضمين
 */
export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

/**
 * نتيجة التضمين
 */
export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    totalTokens: number;
  };
}

/**
 * طلب تحليل الصورة
 */
export interface ImageAnalysisRequest {
  image: string; // URL or base64
  prompt?: string;
  model?: AIModel;
  maxTokens?: number;
}

/**
 * نتيجة تحليل الصورة
 */
export interface ImageAnalysisResponse {
  id: string;
  model: AIModel;
  description: string;
  labels?: Array<{
    label: string;
    confidence: number;
  }>;
  text?: string; // OCR
  objects?: Array<{
    name: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * نموذج للترجمة
 */
export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

/**
 * نتيجة الترجمة
 */
export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

/**
 * طلب الملخص
 */
export interface SummaryRequest {
  text: string;
  maxLength?: number;
  style?: 'brief' | 'detailed' | 'bullet_points';
  language?: string;
}

/**
 * نتيجة الملخص
 */
export interface SummaryResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
}

/**
 * تقرير الاستخدام
 */
export interface UsageReport {
  totalTokens: number;
  totalRequests: number;
  byModel: Record<AIModel, {
    requests: number;
    tokens: number;
    cost?: number;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * حدود المعدل
 */
export interface RateLimit {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerDay: number;
}

/**
 * معلومات النموذج
 */
export interface ModelInfo {
  name: string;
  displayName: string;
  type: 'chat' | 'completion' | 'embedding' | 'vision';
  contextWindow: number;
  maxOutputTokens: number;
  supportsTools: boolean;
  supportsVision: boolean;
  inputCost: number; // per 1k tokens
  outputCost: number; // per 1k tokens
}

// ==================== Provider Interface ====================

/**
 * واجهة مزود الذكاء الاصطناعي
 */
export interface IAIProvider {
  // ==================== Chat ====================

  /**
   * محادثة
   */
  chat(request: ChatRequest): Promise<Result<ChatResponse, Error>>;

  /**
   * محادثة متدفقة
   */
  chatStream(request: ChatRequest): AsyncGenerator<Result<string, Error>, void, unknown>;

  // ==================== Generation ====================

  /**
   * توليد نص
   */
  generate(request: GenerateRequest): Promise<Result<GenerateResponse, Error>>;

  /**
   * توليد متدفق
   */
  generateStream(request: GenerateRequest): AsyncGenerator<Result<string, Error>, void, unknown>;

  // ==================== Embeddings ====================

  /**
   * إنشاء تضمينات
   */
  createEmbeddings(request: EmbeddingRequest): Promise<Result<EmbeddingResponse, Error>>;

  // ==================== Vision ====================

  /**
   * تحليل صورة
   */
  analyzeImage(request: ImageAnalysisRequest): Promise<Result<ImageAnalysisResponse, Error>>;

  /**
   * وصف صورة
   */
  describeImage(imageUrl: string): Promise<Result<string, Error>>;

  // ==================== Specialized Tasks ====================

  /**
   * ترجمة
   */
  translate(request: TranslationRequest): Promise<Result<TranslationResponse, Error>>;

  /**
   * ملخص
   */
  summarize(request: SummaryRequest): Promise<Result<SummaryResponse, Error>>;

  /**
   * تحسين نص
   */
  improveText(text: string, instructions?: string): Promise<Result<string, Error>>;

  /**
   * استخراج معلومات
   */
  extractInformation(text: string, schema: Record<string, string>): Promise<Result<Record<string, unknown>, Error>>;

  /**
   * تصنيف نص
   */
  classifyText(text: string, categories: string[]): Promise<Result<{ category: string; confidence: number }, Error>>;

  /**
   * توليد أسئلة
   */
  generateQuestions(text: string, count?: number): Promise<Result<string[], Error>>;

  /**
   * تقييم الإجابة
   */
  evaluateAnswer(question: string, answer: string, correctAnswer?: string): Promise<Result<{
    score: number;
    feedback: string;
    isCorrect: boolean;
  }, Error>>;

  // ==================== Tools ====================

  /**
   * تنفيذ مع أدوات
   */
  executeWithTools(request: ChatRequest, tools: AITool[]): Promise<Result<{
    response: ChatResponse;
    toolResults?: Array<{
      toolCallId: string;
      result: unknown;
    }>;
  }, Error>>;

  // ==================== Rate Limiting ====================

  /**
   * حدود المعدل
   */
  getRateLimits(): Promise<RateLimit>;

  /**
   * الاستخدام الحالي
   */
  getCurrentUsage(): Promise<{
    requestsThisMinute: number;
    tokensThisMinute: number;
    requestsToday: number;
  }>;

  /**
   * انتظار الحد المتاح
   */
  waitForRateLimit(): Promise<void>;

  // ==================== Models ====================

  /**
   * النماذج المتاحة
   */
  getAvailableModels(): Promise<ModelInfo[]>;

  /**
   * معلومات النموذج
   */
  getModelInfo(model: AIModel): Promise<Result<ModelInfo, Error>>;

  // ==================== Usage ====================

  /**
   * تقرير الاستخدام
   */
  getUsageReport(period?: { start: Date; end: Date }): Promise<UsageReport>;

  /**
   * تقدير التكلفة
   */
  estimateCost(request: ChatRequest): Promise<number>;

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
    models: Array<{
      name: string;
      available: boolean;
    }>;
  }>;
}
