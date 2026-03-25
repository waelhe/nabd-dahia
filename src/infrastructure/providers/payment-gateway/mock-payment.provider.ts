/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mock Payment Gateway Provider - مزود بوابة الدفع الوهمي
 * 
 * @module infrastructure/providers/payment-gateway/mock-payment.provider
 */

import {
  IPaymentGatewayProvider,
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentQuery,
  PaymentInfo,
  RefundRequest,
  RefundResult,
  RefundInfo,
  TransferRequest,
  TransferResult,
  AccountBalance,
  PaymentEvent,
  WebhookPayload,
  PlatformInfo,
  Currency,
  PaymentStatus,
} from '@/core/interfaces/providers/payment-gateway.provider';
import { Result, ok, err } from '@/core/types/result';

// ==================== Mock Storage ====================

interface MockPayment {
  id: string;
  externalId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  fee: number;
  feeCurrency: Currency;
  createdAt: Date;
  updatedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, unknown>;
  checkoutUrl?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

interface MockRefund {
  id: string;
  externalId: string;
  paymentId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processed' | 'failed';
  reason?: string;
  processedAt?: Date;
  failedAt?: Date;
}

interface MockTransfer {
  id: string;
  externalId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  destination: string;
  description?: string;
  estimatedArrival?: Date;
}

interface MockCustomer {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  paymentMethods: Array<{ id: string; type: string; last4?: string }>;
}

// ==================== Mock Payment Provider ====================

/**
 * مزود بوابة الدفع الوهمي - للتطوير والاختبار
 */
export class MockPaymentGatewayProvider implements IPaymentGatewayProvider {
  private payments: Map<string, MockPayment> = new Map();
  private refunds: Map<string, MockRefund> = new Map();
  private transfers: Map<string, MockTransfer> = new Map();
  private customers: Map<string, MockCustomer> = new Map();
  private simulateDelays: boolean;
  private simulateFailures: boolean;
  private failureRate: number;

  constructor(config?: { simulateDelays?: boolean; simulateFailures?: boolean; failureRate?: number }) {
    this.simulateDelays = config?.simulateDelays ?? false;
    this.simulateFailures = config?.simulateFailures ?? false;
    this.failureRate = config?.failureRate ?? 0.1; // 10% failure rate
  }

  private generateId(): string {
    return `pay_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateExternalId(): string {
    return `ext_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async delay(ms: number): Promise<void> {
    if (this.simulateDelays) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  private shouldFail(): boolean {
    return this.simulateFailures && Math.random() < this.failureRate;
  }

  private calculatePlatformFee(amount: number, currency: Currency): number {
    // 2.5% platform fee
    return Math.round(amount * 0.025);
  }

  // ==================== Payment ====================

  async createPayment(request: CreatePaymentRequest): Promise<Result<CreatePaymentResult, Error>> {
    await this.delay(100);

    if (this.shouldFail()) {
      return err(new Error('Payment creation failed (simulated)'));
    }

    const id = this.generateId();
    const externalId = this.generateExternalId();

    const payment: MockPayment = {
      id,
      externalId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      fee: this.calculatePlatformFee(request.amount, request.currency),
      feeCurrency: request.currency,
      createdAt: new Date(),
      metadata: request.metadata,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      customerName: request.customerName,
      checkoutUrl: request.successUrl
        ? `https://mock-payment.example.com/checkout/${id}?success=${request.successUrl}&cancel=${request.cancelUrl || ''}`
        : undefined,
    };

    this.payments.set(id, payment);

    return ok({
      paymentId: id,
      externalId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      checkoutUrl: payment.checkoutUrl,
      clientSecret: `secret_${id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }

  async getPayment(query: PaymentQuery): Promise<Result<PaymentInfo, Error>> {
    await this.delay(50);

    const payment = this.payments.get(query.paymentId);
    if (!payment) {
      return err(new Error('Payment not found'));
    }

    return ok({
      paymentId: payment.id,
      externalId: payment.externalId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      fee: payment.fee,
      feeCurrency: payment.feeCurrency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paidAt: payment.paidAt,
      cancelledAt: payment.cancelledAt,
      refundedAt: payment.refundedAt,
      metadata: payment.metadata,
    });
  }

  async cancelPayment(paymentId: string, reason?: string): Promise<Result<void, Error>> {
    await this.delay(100);

    const payment = this.payments.get(paymentId);
    if (!payment) {
      return err(new Error('Payment not found'));
    }

    if (payment.status !== 'pending') {
      return err(new Error('Payment cannot be cancelled in current status'));
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    payment.updatedAt = new Date();
    this.payments.set(paymentId, payment);

    return ok(undefined);
  }

  async confirmPayment(
    paymentId: string,
    confirmationData?: Record<string, unknown>,
  ): Promise<Result<PaymentInfo, Error>> {
    await this.delay(150);

    const payment = this.payments.get(paymentId);
    if (!payment) {
      return err(new Error('Payment not found'));
    }

    if (payment.status !== 'pending') {
      return err(new Error('Payment cannot be confirmed in current status'));
    }

    // Simulate payment success (or failure if enabled)
    if (this.shouldFail()) {
      payment.status = 'failed';
    } else {
      payment.status = 'completed';
      payment.paidAt = new Date();
    }

    payment.updatedAt = new Date();
    this.payments.set(paymentId, payment);

    return ok({
      paymentId: payment.id,
      externalId: payment.externalId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      fee: payment.fee,
      feeCurrency: payment.feeCurrency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paidAt: payment.paidAt,
      metadata: payment.metadata,
    });
  }

  // ==================== Refund ====================

  async refund(request: RefundRequest): Promise<Result<RefundResult, Error>> {
    await this.delay(100);

    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      return err(new Error('Payment not found'));
    }

    if (payment.status !== 'completed') {
      return err(new Error('Payment must be completed to refund'));
    }

    const refundAmount = request.amount || payment.amount;
    if (refundAmount > payment.amount) {
      return err(new Error('Refund amount cannot exceed payment amount'));
    }

    const refundId = `ref_${Math.random().toString(36).substring(2, 15)}`;
    const refund: MockRefund = {
      id: refundId,
      externalId: this.generateExternalId(),
      paymentId: request.paymentId,
      amount: refundAmount,
      currency: payment.currency,
      status: 'processed',
      reason: request.reason,
      processedAt: new Date(),
    };

    this.refunds.set(refundId, refund);

    // Update payment status if full refund
    if (refundAmount === payment.amount) {
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.updatedAt = new Date();
      this.payments.set(request.paymentId, payment);
    }

    return ok({
      refundId,
      externalId: refund.externalId,
      paymentId: request.paymentId,
      amount: refundAmount,
      currency: payment.currency,
      status: 'processed',
      estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    });
  }

  async getRefund(refundId: string): Promise<Result<RefundInfo, Error>> {
    await this.delay(50);

    const refund = this.refunds.get(refundId);
    if (!refund) {
      return err(new Error('Refund not found'));
    }

    return ok({
      refundId: refund.id,
      externalId: refund.externalId,
      paymentId: refund.paymentId,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      processedAt: refund.processedAt,
      failedAt: refund.failedAt,
    });
  }

  // ==================== Transfer ====================

  async transfer(request: TransferRequest): Promise<Result<TransferResult, Error>> {
    await this.delay(150);

    if (this.shouldFail()) {
      return err(new Error('Transfer failed (simulated)'));
    }

    const transferId = `trf_${Math.random().toString(36).substring(2, 15)}`;
    const destination = typeof request.destination === 'string'
      ? request.destination
      : request.destination.accountNumber;

    const transfer: MockTransfer = {
      id: transferId,
      externalId: this.generateExternalId(),
      amount: request.amount,
      currency: request.currency,
      status: 'completed',
      destination,
      description: request.description,
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    };

    this.transfers.set(transferId, transfer);

    return ok({
      transferId,
      externalId: transfer.externalId,
      amount: request.amount,
      currency: request.currency,
      status: 'completed',
      estimatedArrival: transfer.estimatedArrival,
    });
  }

  async getTransfer(transferId: string): Promise<Result<TransferResult, Error>> {
    await this.delay(50);

    const transfer = this.transfers.get(transferId);
    if (!transfer) {
      return err(new Error('Transfer not found'));
    }

    return ok({
      transferId: transfer.id,
      externalId: transfer.externalId,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.status,
      estimatedArrival: transfer.estimatedArrival,
    });
  }

  // ==================== Account ====================

  async getBalance(currency?: Currency): Promise<Result<AccountBalance[], Error>> {
    await this.delay(50);

    // Return mock balances
    const balances: AccountBalance[] = [
      { currency: 'SYP', available: 10000000, pending: 500000, reserved: 200000 },
      { currency: 'USD', available: 10000, pending: 500, reserved: 200 },
      { currency: 'EUR', available: 8000, pending: 400, reserved: 150 },
    ];

    if (currency) {
      return ok(balances.filter((b) => b.currency === currency));
    }

    return ok(balances);
  }

  // ==================== Customer ====================

  async createCustomer(data: {
    email?: string;
    phone?: string;
    name?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Result<string, Error>> {
    await this.delay(50);

    const customerId = `cus_${Math.random().toString(36).substring(2, 15)}`;
    const customer: MockCustomer = {
      id: customerId,
      email: data.email,
      phone: data.phone,
      name: data.name,
      paymentMethods: [],
    };

    this.customers.set(customerId, customer);
    return ok(customerId);
  }

  async addPaymentMethod(
    customerId: string,
    paymentMethodData: Record<string, unknown>,
  ): Promise<Result<string, Error>> {
    await this.delay(50);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return err(new Error('Customer not found'));
    }

    const pmId = `pm_${Math.random().toString(36).substring(2, 15)}`;
    customer.paymentMethods.push({
      id: pmId,
      type: (paymentMethodData.type as string) || 'card',
      last4: (paymentMethodData.last4 as string) || '4242',
    });

    this.customers.set(customerId, customer);
    return ok(pmId);
  }

  async getPaymentMethods(
    customerId: string,
  ): Promise<Result<Array<{ id: string; type: string; last4?: string }>, Error>> {
    await this.delay(50);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return err(new Error('Customer not found'));
    }

    return ok(customer.paymentMethods);
  }

  // ==================== Webhook ====================

  async processWebhook(payload: WebhookPayload): Promise<Result<PaymentEvent, Error>> {
    await this.delay(50);

    // Mock webhook processing
    const event: PaymentEvent = {
      type: 'payment.completed',
      timestamp: new Date(),
      data: { payload: 'mock_webhook' },
    };

    return ok(event);
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    // Mock signature verification - always true in mock
    return true;
  }

  // ==================== Platform ====================

  async getPlatformInfo(): Promise<PlatformInfo> {
    return {
      name: 'Mock Payment Gateway',
      version: '1.0.0',
      supportedCurrencies: ['SYP', 'USD', 'EUR', 'TRY', 'AED', 'SAR'],
      supportedMethods: ['card', 'bank_transfer', 'wallet', 'cash'],
      minAmount: 100,
      maxAmount: 100000000,
      feePercent: 2.5,
      features: {
        refunds: true,
        partialRefunds: true,
        transfers: true,
        recurring: false,
        installments: false,
      },
    };
  }

  async testConnection(): Promise<Result<boolean, Error>> {
    return ok(true);
  }

  // ==================== Fee ====================

  async calculateFee(
    amount: number,
    currency: Currency,
  ): Promise<{
    platformFee: number;
    gatewayFee: number;
    totalFee: number;
  }> {
    const platformFee = this.calculatePlatformFee(amount, currency);
    const gatewayFee = Math.round(amount * 0.01); // 1% gateway fee

    return {
      platformFee,
      gatewayFee,
      totalFee: platformFee + gatewayFee,
    };
  }

  // ==================== Test Helpers ====================

  /**
   * محاكاة إتمام الدفعة (للاختبارات)
   */
  async simulatePaymentSuccess(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.updatedAt = new Date();
      this.payments.set(paymentId, payment);
    }
  }

  /**
   * محاكاة فشل الدفعة (للاختبارات)
   */
  async simulatePaymentFailure(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = 'failed';
      payment.updatedAt = new Date();
      this.payments.set(paymentId, payment);
    }
  }

  /**
   * إعادة تعيين البيانات الوهمية
   */
  reset(): void {
    this.payments.clear();
    this.refunds.clear();
    this.transfers.clear();
    this.customers.clear();
  }
}
