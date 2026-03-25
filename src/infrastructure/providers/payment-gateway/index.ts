/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Payment Gateway Providers - مزودي بوابة الدفع
 * 
 * @module infrastructure/providers/payment-gateway
 */

export * from './mock-payment.provider';

import { IPaymentGatewayProvider } from '@/core/interfaces/providers/payment-gateway.provider';
import { MockPaymentGatewayProvider } from './mock-payment.provider';

// ==================== Types ====================

export type PaymentProviderType = 'mock' | 'stripe' | 'paypal';

export interface PaymentConfig {
  type: PaymentProviderType;
  mock?: {
    simulateDelays?: boolean;
    simulateFailures?: boolean;
    failureRate?: number;
  };
  stripe?: {
    apiKey: string;
    webhookSecret: string;
  };
  paypal?: {
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
  };
}

// ==================== Factory ====================

/**
 * إنشاء مزود بوابة الدفع المناسب
 */
export function createPaymentProvider(config: PaymentConfig): IPaymentGatewayProvider {
  switch (config.type) {
    case 'mock':
      return new MockPaymentGatewayProvider({
        simulateDelays: config.mock?.simulateDelays,
        simulateFailures: config.mock?.simulateFailures,
        failureRate: config.mock?.failureRate,
      });

    case 'stripe':
      // TODO: Implement Stripe provider
      throw new Error('Stripe payment provider not yet implemented');

    case 'paypal':
      // TODO: Implement PayPal provider
      throw new Error('PayPal payment provider not yet implemented');

    default:
      throw new Error(`Unknown payment provider type: ${config.type}`);
  }
}

// ==================== Singleton Instance ====================

let paymentInstance: IPaymentGatewayProvider | null = null;

/**
 * تهيئة مزود الدفع
 */
export function initializePayment(config: PaymentConfig): IPaymentGatewayProvider {
  paymentInstance = createPaymentProvider(config);
  return paymentInstance;
}

/**
 * الحصول على مزود الدفع
 */
export function getPaymentProvider(): IPaymentGatewayProvider {
  if (!paymentInstance) {
    throw new Error('Payment provider not initialized. Call initializePayment() first.');
  }
  return paymentInstance;
}
