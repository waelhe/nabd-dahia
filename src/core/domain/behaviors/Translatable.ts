/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Translatable Interface & Mixin
 * 
 * سلوك الترجمة - يسمح للكيانات بدعم لغات متعددة.
 * 
 * @module core/domain/behaviors/Translatable
 */

import { Translation, SupportedLanguage } from '../value-objects/Translation';

/**
 * واجهة السلوك
 */
export interface ITranslatable {
  getTranslation(field: string, language: string): string | null;
  setTranslation(field: string, language: string, value: string): void;
  getAvailableTranslations(field: string): SupportedLanguage[];
  hasTranslation(field: string, language: string): boolean;
}

/**
 * حقل قابل للترجمة
 */
export type TranslatableField = Translation;

/**
 * Props للكيانات القابلة للترجمة
 */
export interface TranslatableProps {
  translations?: Record<string, Translation>;
}

/**
 * إنشاء props افتراضية للترجمة
 */
export function createTranslatableProps(): TranslatableProps {
  return {
    translations: {},
  };
}

/**
 * إنشاء حقل قابل للترجمة
 */
export function createTranslatableField(
  initialValue?: string,
  language: SupportedLanguage = 'ar'
): Translation {
  if (initialValue) {
    return Translation.fromText(initialValue, language);
  }
  return Translation.empty();
}

/**
 * الحصول على ترجمة
 */
export function getTranslation(
  props: TranslatableProps,
  field: string,
  language: string,
  fallback: boolean = true
): string | null {
  const fieldTranslations = props.translations?.[field];
  if (!fieldTranslations) return null;
  
  return fieldTranslations.get(language, fallback) || null;
}

/**
 * تعيين ترجمة
 */
export function setTranslation<T extends TranslatableProps & { updatedAt: Date }>(
  entity: T,
  field: string,
  language: SupportedLanguage,
  value: string
): void {
  if (!entity.translations) {
    entity.translations = {};
  }
  
  if (!entity.translations[field]) {
    entity.translations[field] = Translation.empty();
  }
  
  entity.translations[field] = entity.translations[field].set(language, value);
  entity.updatedAt = new Date();
}

/**
 * التحقق من وجود ترجمة
 */
export function hasTranslation(
  props: TranslatableProps,
  field: string,
  language: string
): boolean {
  const fieldTranslations = props.translations?.[field];
  if (!fieldTranslations) return false;
  
  return fieldTranslations.has(language);
}

/**
 * الحصول على اللغات المتاحة لحقل
 */
export function getAvailableTranslations(
  props: TranslatableProps,
  field: string
): SupportedLanguage[] {
  const fieldTranslations = props.translations?.[field];
  if (!fieldTranslations) return [];
  
  return fieldTranslations.availableLanguages as SupportedLanguage[];
}

/**
 * الحصول على كل الترجمات لحقل
 */
export function getAllTranslations(
  props: TranslatableProps,
  field: string
): Record<string, string> {
  const fieldTranslations = props.translations?.[field];
  if (!fieldTranslations) return {};
  
  return fieldTranslations.toObject();
}

/**
 * التحقق من أن الحقل مترجم بالكامل
 */
export function isFullyTranslated(
  props: TranslatableProps,
  field: string,
  requiredLanguages: SupportedLanguage[] = ['ar', 'en']
): boolean {
  return requiredLanguages.every(lang => hasTranslation(props, field, lang));
}

/**
 * الحصول على نسبة اكتمال الترجمة
 */
export function getTranslationCompleteness(
  props: TranslatableProps,
  field: string,
  requiredLanguages: SupportedLanguage[] = ['ar', 'en', 'fr', 'tr', 'ru']
): number {
  if (requiredLanguages.length === 0) return 1;
  
  const translated = requiredLanguages.filter(lang => hasTranslation(props, field, lang));
  return translated.length / requiredLanguages.length;
}

/**
 * الحصول على الحقول غير المترجمة
 */
export function getMissingTranslations(
  props: TranslatableProps,
  fields: string[],
  requiredLanguages: SupportedLanguage[] = ['ar', 'en']
): Array<{ field: string; language: SupportedLanguage }> {
  const missing: Array<{ field: string; language: SupportedLanguage }> = [];
  
  for (const field of fields) {
    for (const language of requiredLanguages) {
      if (!hasTranslation(props, field, language)) {
        missing.push({ field, language });
      }
    }
  }
  
  return missing;
}

/**
 * نسخ الترجمات
 */
export function copyTranslations(
  props: TranslatableProps,
  fromField: string,
  toField: string
): Record<string, Translation> | undefined {
  const sourceTranslations = props.translations?.[fromField];
  if (!sourceTranslations) return undefined;
  
  return {
    ...props.translations,
    [toField]: Translation.from(sourceTranslations.toObject()),
  };
}

/**
 * دمج الترجمات
 */
export function mergeTranslations(
  props: TranslatableProps,
  newTranslations: Record<string, Translation>
): Record<string, Translation> {
  return {
    ...(props.translations || {}),
    ...newTranslations,
  };
}

/**
 * حذف ترجمة لحقل معين
 */
export function removeTranslation(
  props: TranslatableProps,
  field: string,
  language: SupportedLanguage
): Record<string, Translation> | undefined {
  const fieldTranslations = props.translations?.[field];
  if (!fieldTranslations) return props.translations;
  
  const updated = fieldTranslations.remove(language);
  
  return {
    ...props.translations,
    [field]: updated,
  };
}

/**
 * حذف كل ترجمات حقل
 */
export function removeAllFieldTranslations(
  props: TranslatableProps,
  field: string
): Record<string, Translation> | undefined {
  if (!props.translations) return undefined;
  
  const { [field]: _, ...rest } = props.translations;
  return rest;
}
