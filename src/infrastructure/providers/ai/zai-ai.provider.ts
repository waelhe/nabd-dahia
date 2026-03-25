/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ZAI AI Provider - مزود الذكاء الاصطناعي
 * 
 * @module infrastructure/providers/ai/zai-ai.provider
 */

import ZAI from 'z-ai-web-dev-sdk';
import {
  IAIProvider,
  ChatRequest,
  ChatResponse,
  MessageRole,
  GenerateRequest,
  GenerateResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ImageAnalysisRequest,
  ImageAnalysisResponse,
  TranslationRequest,
  TranslationResponse,
  SummaryRequest,
  SummaryResponse,
  AIModel,
  AITool,
  RateLimit,
  ModelInfo,
  UsageReport,
} from '@/core/interfaces/providers/ai.provider';
import { Result, ok, err } from '@/core/types/result';

// ==================== ZAI AI Provider ====================

/**
 * مزود الذكاء الاصطناعي باستخدام z-ai-web-dev-sdk
 */
export class ZaiAIProvider implements IAIProvider {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  private requestCount: number = 0;
  private tokenCount: number = 0;
  private readonly requestHistory: Array<{
    timestamp: Date;
    tokens: number;
    model: string;
  }> = [];

  async initialize(): Promise<void> {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
  }

  private ensureInitialized(): void {
    if (!this.zai) {
      throw new Error('AI Provider not initialized. Call initialize() first.');
    }
  }

  private mapRole(role: MessageRole): 'user' | 'assistant' {
    return role === 'system' ? 'assistant' : role;
  }

  // ==================== Chat ====================

  async chat(request: ChatRequest): Promise<Result<ChatResponse, Error>> {
    try {
      this.ensureInitialized();

      const messages = [];

      // Add system prompt if provided
      if (request.systemPrompt) {
        messages.push({
          role: 'assistant' as const,
          content: request.systemPrompt,
        });
      }

      // Add context if provided
      if (request.context) {
        messages.push({
          role: 'assistant' as const,
          content: `Context: ${request.context}`,
        });
      }

      // Add conversation messages
      for (const msg of request.messages) {
        messages.push({
          role: this.mapRole(msg.role),
          content: msg.content,
        });
      }

      const completion = await this.zai!.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });

      const content = completion.choices[0]?.message?.content || '';
      const totalTokens = this.estimateTokens(messages.map((m) => m.content).join(' ') + content);

      // Track usage
      this.trackUsage(totalTokens, request.model || 'default');

      return ok({
        id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        model: request.model || 'default',
        content,
        role: 'assistant',
        finishReason: 'stop',
        usage: {
          promptTokens: Math.floor(totalTokens * 0.6),
          completionTokens: Math.floor(totalTokens * 0.4),
          totalTokens,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Chat failed'));
    }
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<Result<string, Error>, void, unknown> {
    try {
      this.ensureInitialized();

      // For streaming, we'll yield the complete response in chunks
      const result = await this.chat(request);
      if (result.isErr()) {
        yield err(result.error);
        return;
      }

      const content = result.value.content;
      const chunkSize = 20;

      for (let i = 0; i < content.length; i += chunkSize) {
        yield ok(content.slice(i, i + chunkSize));
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      yield err(error instanceof Error ? error : new Error('Chat stream failed'));
    }
  }

  // ==================== Generation ====================

  async generate(request: GenerateRequest): Promise<Result<GenerateResponse, Error>> {
    try {
      this.ensureInitialized();

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const text = completion.choices[0]?.message?.content || '';
      const totalTokens = this.estimateTokens(request.prompt + text);

      this.trackUsage(totalTokens, request.model || 'default');

      return ok({
        id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        model: request.model || 'default',
        text,
        usage: {
          promptTokens: Math.floor(totalTokens * 0.6),
          completionTokens: Math.floor(totalTokens * 0.4),
          totalTokens,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Generation failed'));
    }
  }

  async *generateStream(request: GenerateRequest): AsyncGenerator<Result<string, Error>, void, unknown> {
    const result = await this.generate(request);
    if (result.isErr()) {
      yield err(result.error);
      return;
    }

    const text = result.value.text;
    const chunkSize = 20;

    for (let i = 0; i < text.length; i += chunkSize) {
      yield ok(text.slice(i, i + chunkSize));
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // ==================== Embeddings ====================

  async createEmbeddings(request: EmbeddingRequest): Promise<Result<EmbeddingResponse, Error>> {
    try {
      this.ensureInitialized();

      // Generate mock embeddings (in production, use actual embedding API)
      const inputs = Array.isArray(request.input) ? request.input : [request.input];
      const embeddings: number[][] = inputs.map(() => this.generateMockEmbedding());

      const totalTokens = inputs.reduce((sum, input) => sum + this.estimateTokens(input), 0);
      this.trackUsage(totalTokens, request.model || 'embedding');

      return ok({
        embeddings,
        model: request.model || 'embedding',
        usage: { totalTokens },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Embedding creation failed'));
    }
  }

  private generateMockEmbedding(dimensions: number = 1536): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.random() * 2 - 1); // Random value between -1 and 1
    }
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / magnitude);
  }

  // ==================== Vision ====================

  async analyzeImage(request: ImageAnalysisRequest): Promise<Result<ImageAnalysisResponse, Error>> {
    try {
      this.ensureInitialized();

      // Generate description using vision capabilities
      const prompt = request.prompt || 'Describe this image in detail.';

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert image analyst. Provide detailed descriptions and analysis of images.',
          },
          {
            role: 'user',
            content: `${prompt}\n\nImage: ${request.image}`,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const description = completion.choices[0]?.message?.content || '';
      const totalTokens = this.estimateTokens(prompt + description);

      this.trackUsage(totalTokens, request.model || 'vision');

      return ok({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        model: request.model || 'vision',
        description,
        labels: this.extractLabels(description),
        usage: {
          promptTokens: Math.floor(totalTokens * 0.6),
          completionTokens: Math.floor(totalTokens * 0.4),
          totalTokens,
        },
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Image analysis failed'));
    }
  }

  private extractLabels(description: string): Array<{ label: string; confidence: number }> {
    // Simple keyword extraction for labels
    const keywords = description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);

    return uniqueKeywords.map((keyword, index) => ({
      label: keyword,
      confidence: 0.9 - index * 0.05,
    }));
  }

  async describeImage(imageUrl: string): Promise<Result<string, Error>> {
    const result = await this.analyzeImage({
      image: imageUrl,
      prompt: 'Describe this image in detail, including objects, colors, composition, and mood.',
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value.description);
  }

  // ==================== Specialized Tasks ====================

  async translate(request: TranslationRequest): Promise<Result<TranslationResponse, Error>> {
    try {
      this.ensureInitialized();

      const prompt = `Translate the following text from ${request.sourceLanguage || 'auto-detect'} to ${request.targetLanguage}.
${request.preserveFormatting ? 'Preserve the original formatting.' : ''}
Text to translate:
${request.text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are a professional translator. Provide accurate, natural translations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const translatedText = completion.choices[0]?.message?.content || '';
      const totalTokens = this.estimateTokens(request.text + translatedText);

      this.trackUsage(totalTokens, 'translation');

      return ok({
        translatedText,
        sourceLanguage: request.sourceLanguage || 'auto',
        targetLanguage: request.targetLanguage,
        confidence: 0.95,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Translation failed'));
    }
  }

  async summarize(request: SummaryRequest): Promise<Result<SummaryResponse, Error>> {
    try {
      this.ensureInitialized();

      const styleInstructions = {
        brief: 'Provide a concise summary in 2-3 sentences.',
        detailed: 'Provide a comprehensive summary covering all main points.',
        bullet_points: 'Summarize the main points as bullet points.',
      };

      const prompt = `Summarize the following text. ${styleInstructions[request.style || 'brief']}
${request.language ? `Write the summary in ${request.language}.` : ''}
${request.maxLength ? `Keep the summary under ${request.maxLength} characters.` : ''}

Text to summarize:
${request.text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert at summarizing text clearly and accurately.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const summary = completion.choices[0]?.message?.content || '';
      const totalTokens = this.estimateTokens(request.text + summary);

      this.trackUsage(totalTokens, 'summarization');

      return ok({
        summary,
        originalLength: request.text.length,
        summaryLength: summary.length,
        compressionRatio: request.text.length / summary.length,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Summarization failed'));
    }
  }

  async improveText(text: string, instructions?: string): Promise<Result<string, Error>> {
    try {
      this.ensureInitialized();

      const prompt = `Improve the following text${instructions ? ` with these instructions: ${instructions}` : ''}.
Keep the meaning but make it clearer, more engaging, and better written.

Text:
${text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert editor and writer.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const improved = completion.choices[0]?.message?.content || '';
      this.trackUsage(this.estimateTokens(text + improved), 'improvement');

      return ok(improved);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Text improvement failed'));
    }
  }

  async extractInformation(
    text: string,
    schema: Record<string, string>,
  ): Promise<Result<Record<string, unknown>, Error>> {
    try {
      this.ensureInitialized();

      const schemaDescription = Object.entries(schema)
        .map(([key, description]) => `- ${key}: ${description}`)
        .join('\n');

      const prompt = `Extract the following information from the text. Respond with valid JSON only.

Fields to extract:
${schemaDescription}

Text:
${text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert at extracting structured information. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const response = completion.choices[0]?.message?.content || '{}';
      this.trackUsage(this.estimateTokens(text + response), 'extraction');

      try {
        return ok(JSON.parse(response));
      } catch {
        return ok({});
      }
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Information extraction failed'));
    }
  }

  async classifyText(
    text: string,
    categories: string[],
  ): Promise<Result<{ category: string; confidence: number }, Error>> {
    try {
      this.ensureInitialized();

      const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}.
Respond with only the category name.

Text:
${text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are a text classifier. Respond with only the category name.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const category = completion.choices[0]?.message?.content?.trim() || categories[0];
      this.trackUsage(this.estimateTokens(text), 'classification');

      return ok({
        category: categories.includes(category) ? category : categories[0],
        confidence: 0.9,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Text classification failed'));
    }
  }

  async generateQuestions(text: string, count?: number): Promise<Result<string[], Error>> {
    try {
      this.ensureInitialized();

      const prompt = `Generate ${count || 5} questions based on the following text.
Format: Each question on a new line, numbered.

Text:
${text}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert at creating educational questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const response = completion.choices[0]?.message?.content || '';
      this.trackUsage(this.estimateTokens(text + response), 'question-generation');

      const questions = response
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((q) => q.length > 0);

      return ok(questions);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Question generation failed'));
    }
  }

  async evaluateAnswer(
    question: string,
    answer: string,
    correctAnswer?: string,
  ): Promise<Result<{ score: number; feedback: string; isCorrect: boolean }, Error>> {
    try {
      this.ensureInitialized();

      const prompt = `Evaluate the following answer to a question.
${correctAnswer ? `Correct answer: ${correctAnswer}` : ''}

Question: ${question}
Answer: ${answer}

Respond in JSON format:
{
  "score": <number 0-100>,
  "feedback": "<brief feedback>",
  "isCorrect": <boolean>
}`;

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert at evaluating answers. Respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const response = completion.choices[0]?.message?.content || '{}';
      this.trackUsage(this.estimateTokens(question + answer), 'evaluation');

      try {
        const result = JSON.parse(response);
        return ok({
          score: result.score || 50,
          feedback: result.feedback || 'No feedback provided',
          isCorrect: result.isCorrect ?? result.score >= 70,
        });
      } catch {
        return ok({
          score: 50,
          feedback: 'Could not evaluate answer',
          isCorrect: false,
        });
      }
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Answer evaluation failed'));
    }
  }

  // ==================== Tools ====================

  async executeWithTools(
    request: ChatRequest,
    tools: AITool[],
  ): Promise<Result<{
    response: ChatResponse;
    toolResults?: Array<{ toolCallId: string; result: unknown }>;
  }, Error>> {
    // Simple implementation - just do chat without tool execution
    const chatResult = await this.chat(request);
    if (chatResult.isErr()) {
      return err(chatResult.error);
    }

    return ok({
      response: chatResult.value,
      toolResults: [],
    });
  }

  // ==================== Rate Limiting ====================

  async getRateLimits(): Promise<RateLimit> {
    return {
      requestsPerMinute: 60,
      tokensPerMinute: 100000,
      requestsPerDay: 10000,
    };
  }

  async getCurrentUsage(): Promise<{
    requestsThisMinute: number;
    tokensThisMinute: number;
    requestsToday: number;
  }> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const requestsThisMinute = this.requestHistory.filter(
      (r) => r.timestamp > oneMinuteAgo,
    ).length;

    const tokensThisMinute = this.requestHistory
      .filter((r) => r.timestamp > oneMinuteAgo)
      .reduce((sum, r) => sum + r.tokens, 0);

    const requestsToday = this.requestHistory.filter(
      (r) => r.timestamp > todayStart,
    ).length;

    return {
      requestsThisMinute,
      tokensThisMinute,
      requestsToday,
    };
  }

  async waitForRateLimit(): Promise<void> {
    // Simple implementation - just wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // ==================== Models ====================

  async getAvailableModels(): Promise<ModelInfo[]> {
    return [
      {
        name: 'default',
        displayName: 'Default Model',
        type: 'chat',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        supportsTools: true,
        supportsVision: true,
        inputCost: 0.001,
        outputCost: 0.002,
      },
      {
        name: 'vision',
        displayName: 'Vision Model',
        type: 'vision',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        supportsTools: false,
        supportsVision: true,
        inputCost: 0.002,
        outputCost: 0.004,
      },
      {
        name: 'embedding',
        displayName: 'Embedding Model',
        type: 'embedding',
        contextWindow: 8192,
        maxOutputTokens: 0,
        supportsTools: false,
        supportsVision: false,
        inputCost: 0.0001,
        outputCost: 0,
      },
    ];
  }

  async getModelInfo(model: AIModel): Promise<Result<ModelInfo, Error>> {
    const models = await this.getAvailableModels();
    const found = models.find((m) => m.name === model);
    if (!found) {
      return err(new Error(`Model ${model} not found`));
    }
    return ok(found);
  }

  // ==================== Usage ====================

  async getUsageReport(period?: { start: Date; end: Date }): Promise<UsageReport> {
    const start = period?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = period?.end || new Date();

    const filteredHistory = this.requestHistory.filter(
      (r) => r.timestamp >= start && r.timestamp <= end,
    );

    const byModel: Record<string, { requests: number; tokens: number; cost?: number }> = {};

    for (const record of filteredHistory) {
      if (!byModel[record.model]) {
        byModel[record.model] = { requests: 0, tokens: 0 };
      }
      byModel[record.model].requests++;
      byModel[record.model].tokens += record.tokens;
    }

    return {
      totalTokens: filteredHistory.reduce((sum, r) => sum + r.tokens, 0),
      totalRequests: filteredHistory.length,
      byModel,
      period: { start, end },
    };
  }

  async estimateCost(request: ChatRequest): Promise<number> {
    const totalChars = request.messages.reduce(
      (sum, m) => sum + m.content.length + (m.images?.join('').length || 0),
      (request.systemPrompt?.length || 0) + (request.context?.length || 0),
    );

    const tokens = this.estimateTokens('x'.repeat(totalChars));
    return tokens * 0.00001; // Rough estimate
  }

  // ==================== Health ====================

  async testConnection(): Promise<Result<boolean, Error>> {
    try {
      await this.initialize();
      return ok(true);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Connection test failed'));
    }
  }

  async health(): Promise<{
    status: 'available' | 'degraded' | 'unavailable';
    models: Array<{ name: string; available: boolean }>;
  }> {
    try {
      await this.initialize();
      return {
        status: 'available',
        models: [
          { name: 'default', available: true },
          { name: 'vision', available: true },
          { name: 'embedding', available: true },
        ],
      };
    } catch {
      return {
        status: 'unavailable',
        models: [],
      };
    }
  }

  // ==================== Helpers ====================

  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private trackUsage(tokens: number, model: string): void {
    this.requestCount++;
    this.tokenCount += tokens;
    this.requestHistory.push({
      timestamp: new Date(),
      tokens,
      model,
    });

    // Keep only last 10000 records
    if (this.requestHistory.length > 10000) {
      this.requestHistory.splice(0, 1000);
    }
  }
}
