/**
 * Shipping adapter — abstract interface so we can drop in Shiprocket, Delhivery,
 * Bluedart, or a manual ops workflow without changing callers.
 */
import { logger } from '../config/logger';

export interface ShippingQuote {
  courier: string;
  rateINR: number;
  etaDays: { min: number; max: number };
  cod: boolean;
}

export interface CreateShipmentInput {
  orderNumber: string;
  pickupPincode: string;
  dropPincode: string;
  weightGrams: number;
  declaredValueINR: number;
  recipient: { name: string; phone: string; address: string; city: string; state: string };
}

export interface ShipmentResult {
  courier: string;
  trackingId: string;
  awbUrl?: string;
  estimatedDeliveryDate?: Date;
}

export interface ShippingProvider {
  name: string;
  quote(pickup: string, drop: string, weightGrams: number): Promise<ShippingQuote[]>;
  createShipment(input: CreateShipmentInput): Promise<ShipmentResult>;
  track(trackingId: string): Promise<{ status: string; checkpoints: { at: Date; label: string }[] }>;
}

/** Default stub — returns sensible placeholders until a real provider is wired. */
class StubShipping implements ShippingProvider {
  name = 'stub';
  async quote(_p: string, _d: string, _w: number): Promise<ShippingQuote[]> {
    return [
      { courier: 'Standard', rateINR: 120, etaDays: { min: 3, max: 5 }, cod: false },
      { courier: 'Express', rateINR: 260, etaDays: { min: 1, max: 2 }, cod: false },
    ];
  }
  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    logger.warn({ order: input.orderNumber }, 'Shipping provider not configured — stub shipment created');
    const eta = new Date();
    eta.setDate(eta.getDate() + 4);
    return {
      courier: 'Standard',
      trackingId: `STUB-${input.orderNumber}`,
      estimatedDeliveryDate: eta,
    };
  }
  async track(trackingId: string) {
    return {
      status: 'in_transit',
      checkpoints: [{ at: new Date(), label: `Stub tracking for ${trackingId}` }],
    };
  }
}

let provider: ShippingProvider = new StubShipping();

export function setShippingProvider(p: ShippingProvider) {
  provider = p;
  logger.info({ provider: p.name }, 'Shipping provider registered');
}

export function shipping(): ShippingProvider {
  return provider;
}
