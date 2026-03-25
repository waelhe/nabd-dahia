/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Translation Value Object - كائن قيمة الترجمة
 * 
 * يمثل نصاً مترجماً بعدة لغات.
 * يدعم العربية والإنجليزية والفرنسية والتركية والروسية.
 * يستخدم Result Pattern للمعالجة الآمنة.
 * 
 * @module core/domain/value-objects/Translation
 */

import { Result, ok, err } from '../../types/result';

// ==================== Types ====================

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'tr' | 'ru';

export interface TranslationMap {
  [key: string]: string;
}

export interface TranslationProps {
  translations: TranslationMap;
  defaultLanguage?: SupportedLanguage;
}

// ==================== Constants ====================

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['ar', 'en', 'fr', 'tr', 'ru'];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';

export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string }> = {
  ar: { native: 'العربية', english: 'Arabic' },
  en: { native: 'English', english: 'English' },
  fr: { native: 'Français', english: 'French' },
  tr: { native: 'Türkçe', english: 'Turkish' },
  ru: { native: 'Русский', english: 'Russian' },
};

export const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar'];

// ==================== Errors ====================

export class TranslationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TranslationError';
  }

  static unsupportedLanguage(language: string): TranslationError {
    return new TranslationError('UNSUPPORTED_LANGUAGE', 
      `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
      { language, supported: SUPPORTED_LANGUAGES }
    );
  }

  static missingTranslation(language: string): TranslationError {
    return new TranslationError('MISSING_TRANSLATION', 
      `Missing translation for language: ${language}`,
      { language }
    );
  }

  static emptyTranslation(language: string): TranslationError {
    return new TranslationError('EMPTY_TRANSLATION', 
      `Empty translation for language: ${language}`,
      { language }
    );
  }

  static invalidTranslationMap(reason: string): TranslationError {
    return new TranslationError('INVALID_TRANSLATION_MAP', 
      `Invalid translation map: ${reason}`,
      { reason }
    );
  }
}

// ==================== Translation Class ====================

export class Translation {
  private readonly _translations: Map<string, string>;
  private readonly _defaultLanguage: SupportedLanguage;

  // اللغات المدعومة
  static readonly SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
  
  // اللغة الافتراضية
  static readonly DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
  
  // أسماء اللغات
  static readonly LANGUAGE_NAMES = LANGUAGE_NAMES;

  // اتجاه النص
  static readonly RTL_LANGUAGES = RTL_LANGUAGES;

  private constructor(translations: Map<string, string>, defaultLanguage: SupportedLanguage = DEFAULT_LANGUAGE) {
    this._translations = translations;
    this._defaultLanguage = defaultLanguage;
  }

  // ==================== Factory Methods ====================

  /**
   * إنشاء ترجمة (آمن)
   */
  static create(translations: TranslationMap, defaultLanguage: SupportedLanguage = DEFAULT_LANGUAGE): Result<Translation, TranslationError> {
    // التحقق من الكائن
    if (!translations || typeof translations !== 'object') {
      return err(TranslationError.invalidTranslationMap('translations must be a non-null object'));
    }

    const translationMap = new Map<string, string>();
    
    for (const [lang, text] of Object.entries(translations)) {
      // التحقق من اللغة
      const normalizedLang = lang.toLowerCase();
      if (!SUPPORTED_LANGUAGES.includes(normalizedLang as SupportedLanguage)) {
        return err(TranslationError.unsupportedLanguage(lang));
      }

      // التحقق من النص
      if (typeof text !== 'string') {
        return err(TranslationError.invalidTranslationMap(`Text for language ${lang} must be a string`));
      }

      translationMap.set(normalizedLang, text);
    }

    return ok(new Translation(translationMap, defaultLanguage));
  }

  /**
   * إنشاء ترجمة (يرمي خطأ)
   * @deprecated استخدم create بدلاً منه
   */
  static from(translations: TranslationMap): Translation {
    const result = Translation.create(translations);
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * إنشاء من نص واحد (سيستخدم اللغة الافتراضية)
   */
  static fromText(text: string, language: SupportedLanguage = DEFAULT_LANGUAGE): Result<Translation, TranslationError> {
    if (typeof text !== 'string') {
      return err(TranslationError.invalidTranslationMap('Text must be a string'));
    }
    return Translation.create({ [language]: text }, language);
  }

  /**
   * إنشاء ترجمة عربية-إنجليزية
   */
  static bilingual(ar: string, en: string): Result<Translation, TranslationError> {
    return Translation.create({ ar, en });
  }

  /**
   * ترجمة فارغة
   */
  static empty(): Translation {
    return new Translation(new Map());
  }

  // ==================== Getters ====================

  /**
   * الحصول على ترجمة بلغة معينة
   */
  get(language: string, fallback: boolean = true): string | undefined {
    const normalizedLang = language.toLowerCase();
    const translation = this._translations.get(normalizedLang);
    
    if (translation !== undefined) {
      return translation;
    }
    
    // محاولة استخدام اللغة الافتراضية
    if (fallback) {
      return this._translations.get(this._defaultLanguage);
    }
    
    return undefined;
  }

  /**
   * الحصول على ترجمة أو استخدم نص افتراضي
   */
  getOr(language: string, defaultValue: string): string {
    return this.get(language) ?? defaultValue;
  }

  /**
   * الحصول على ترجمة مع فحص صارم
   */
  getStrict(language: string): Result<string, TranslationError> {
    const translation = this.get(language, false);
    
    if (translation === undefined) {
      return err(TranslationError.missingTranslation(language));
    }
    
    if (translation.trim() === '') {
      return err(TranslationError.emptyTranslation(language));
    }
    
    return ok(translation);
  }

  /**
   * اللغات المتوفرة
   */
  get availableLanguages(): string[] {
    return Array.from(this._translations.keys());
  }

  /**
   * عدد الترجمات
   */
  get count(): number {
    return this._translations.size;
  }

  /**
   * اللغة الافتراضية
   */
  get defaultLanguage(): SupportedLanguage {
    return this._defaultLanguage;
  }

  // ==================== Operations ====================

  /**
   * تعيين ترجمة
   */
  set(language: string, text: string): Result<Translation, TranslationError> {
    const normalizedLang = language.toLowerCase();
    
    if (!SUPPORTED_LANGUAGES.includes(normalizedLang as SupportedLanguage)) {
      return err(TranslationError.unsupportedLanguage(language));
    }

    if (typeof text !== 'string') {
      return err(TranslationError.invalidTranslationMap('Text must be a string'));
    }

    const newTranslations = new Map(this._translations);
    newTranslations.set(normalizedLang, text);
    
    return ok(new Translation(newTranslations, this._defaultLanguage));
  }

  /**
   * حذف ترجمة
   */
  remove(language: string): Translation {
    const newTranslations = new Map(this._translations);
    newTranslations.delete(language.toLowerCase());
    return new Translation(newTranslations, this._defaultLanguage);
  }

  /**
   * هل هناك ترجمة للغة معينة
   */
  has(language: string): boolean {
    return this._translations.has(language.toLowerCase());
  }

  /**
   * هل النص فارغ
   */
  isEmpty(): boolean {
    if (this._translations.size === 0) return true;
    
    for (const text of this._translations.values()) {
      if (text.trim().length > 0) return false;
    }
    
    return true;
  }

  /**
   * الحصول على الترجمة الأطول
   */
  getLongest(): string {
    let longest = '';
    for (const text of this._translations.values()) {
      if (text.length > longest.length) {
        longest = text;
      }
    }
    return longest;
  }

  /**
   * الحصول على الترجمة الأقصر
   */
  getShortest(): string {
    let shortest: string | null = null;
    for (const text of this._translations.values()) {
      if (shortest === null || text.length < shortest.length) {
        shortest = text;
      }
    }
    return shortest || '';
  }

  /**
   * اقتطاع كل الترجمات
   */
  truncate(maxLength: number): Translation {
    const newTranslations = new Map<string, string>();
    
    for (const [lang, text] of this._translations) {
      newTranslations.set(
        lang, 
        text.length > maxLength 
          ? text.slice(0, maxLength - 3) + '...' 
          : text
      );
    }
    
    return new Translation(newTranslations, this._defaultLanguage);
  }

  /**
   * دمج ترجمتين
   */
  merge(other: Translation): Translation {
    const newTranslations = new Map(this._translations);
    
    for (const [lang, text] of other._translations) {
      if (!newTranslations.has(lang)) {
        newTranslations.set(lang, text);
      }
    }
    
    return new Translation(newTranslations, this._defaultLanguage);
  }

  // ==================== Static Utilities ====================

  /**
   * هل اللغة من اليمين لليسار
   */
  static isRTL(language: string): boolean {
    return RTL_LANGUAGES.includes(language.toLowerCase() as SupportedLanguage);
  }

  /**
   * الحصول على اتجاه النص
   */
  static getDirection(language: string): 'rtl' | 'ltr' {
    return Translation.isRTL(language) ? 'rtl' : 'ltr';
  }

  /**
   * الحصول على اسم اللغة
   */
  static getLanguageName(language: SupportedLanguage, native: boolean = true): string {
    const info = LANGUAGE_NAMES[language];
    return native ? info.native : info.english;
  }

  /**
   * التحقق من دعم اللغة
   */
  static isSupported(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language.toLowerCase() as SupportedLanguage);
  }

  // ==================== Serialization ====================

  /**
   * تحويل إلى كائن
   */
  toObject(): TranslationMap {
    return Object.fromEntries(this._translations);
  }

  toJSON(): TranslationMap {
    return this.toObject();
  }

  toString(language: string = DEFAULT_LANGUAGE): string {
    return this.get(language) || '';
  }

  equals(other: Translation): boolean {
    if (this._translations.size !== other._translations.size) {
      return false;
    }
    
    for (const [lang, text] of this._translations) {
      if (other.get(lang, false) !== text) {
        return false;
      }
    }
    
    return true;
  }
}
