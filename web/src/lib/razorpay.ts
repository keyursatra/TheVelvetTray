'use client';

interface RazorpayOptions {
  key: string;
  amount: number;            // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (resp: { error: { code: string; description: string; reason?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay must load in the browser'));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Razorpay script failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface PayParams {
  keyId: string;
  amountINR: number;
  currency: string;
  razorpayOrderId: string;
  orderNumber: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export async function openRazorpayCheckout(params: PayParams): Promise<{ paymentId: string; orderId: string; signature: string }> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error('Razorpay SDK unavailable');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: params.keyId,
      amount: Math.round(params.amountINR * 100),
      currency: params.currency,
      name: 'The Velvet Tray',
      description: `Order ${params.orderNumber}`,
      order_id: params.razorpayOrderId,
      prefill: params.prefill,
      theme: { color: '#7A1F2B' },
      handler: (resp) => resolve({
        paymentId: resp.razorpay_payment_id,
        orderId: resp.razorpay_order_id,
        signature: resp.razorpay_signature,
      }),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp.error.description || 'Payment failed')));
    rzp.open();
  });
}
