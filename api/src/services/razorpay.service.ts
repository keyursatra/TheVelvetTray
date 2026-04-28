import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/ApiError';

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (client) return client;
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw ApiError.server('Razorpay not configured — add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET');
  }
  client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  return client;
}

export async function createPaymentOrder(params: {
  amountINR: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const rzp = getClient();
  const order = await rzp.orders.create({
    amount: Math.round(params.amountINR * 100),
    currency: 'INR',
    receipt: params.receipt,
    notes: params.notes,
  });
  logger.info({ orderId: order.id, amount: order.amount }, 'Razorpay order created');
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!env.RAZORPAY_KEY_SECRET) throw ApiError.server('Razorpay secret missing');
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest('hex');
  return safeEqual(expected, params.razorpaySignature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
