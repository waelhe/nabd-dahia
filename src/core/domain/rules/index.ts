/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain Rules Index
 * 
 * @module core/domain/rules
 */

// Booking Rules
export * from './booking-rules';

// Payment Rules
export * from './payment-rules';

// Cancellation Rules
export * from './cancellation-rules';

// Refund Rules (exported from payment-rules)
export { calculateRefundAmount, canRefund, splitPayment } from './payment-rules';

// Escrow Rules
export * from './escrow-rules';

// Dispute Rules
export * from './dispute-rules';
