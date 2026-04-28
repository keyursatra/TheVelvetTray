import { Schema, model, type Document, type Types } from 'mongoose';
import type { Address } from './User';
import { orderNumber } from '../utils/slugify';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_production'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'partially_delivered'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'authorized' | 'captured' | 'refunded' | 'failed';

export interface OrderCustomization {
  key: string;
  value: string;
}

export interface OrderLine {
  hamper: Types.ObjectId;
  hamperSnapshot: {
    name: string;
    slug: string;
    tier: string;
    priceINR: number;
    image?: string;
  };
  quantity: number;
  unitPriceINR: number;
  customization?: OrderCustomization[];
  giftNote?: { to?: string; from?: string; message?: string };
  shippingAddress: Address;
  deliveryDate?: Date;
  substitutions?: { productName: string; substitutedWith: string; reason?: string }[];
  status: OrderStatus;         // line-level status supports partial fulfillment
  trackingId?: string;
  courier?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  number: string;              // VT-YYYYMMDD-XXXX
  user?: Types.ObjectId;
  guestEmail?: string;         // guest checkout
  guestPhone?: string;
  type: 'individual' | 'corporate' | 'wedding' | 'custom';
  lines: OrderLine[];
  subtotalINR: number;
  taxINR: number;              // GST
  shippingINR: number;
  discountINR: number;
  totalINR: number;
  currency: 'INR';
  coupon?: string;

  paymentStatus: PaymentStatus;
  paymentProvider?: 'razorpay' | 'manual' | 'cod';
  paymentMeta?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    invoiceUrl?: string;
    gstInvoiceNumber?: string;
  };

  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: Date; note?: string; by?: Types.ObjectId }[];

  corporate?: {
    poNumber?: string;
    approvedBy?: string;
    branding?: { logoUrl?: string; noteCopy?: string };
    splitByAddress?: boolean;
  };

  notes?: string;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSnapshotSchema = new Schema(
  {
    label: String,
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'IN' },
    landmark: String,
  },
  { _id: false },
);

const OrderLineSchema = new Schema<OrderLine>(
  {
    hamper: { type: Schema.Types.ObjectId, ref: 'Hamper', required: true },
    hamperSnapshot: {
      name: { type: String, required: true },
      slug: String,
      tier: String,
      priceINR: Number,
      image: String,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceINR: { type: Number, required: true, min: 0 },
    customization: [{ key: String, value: String }],
    giftNote: { to: String, from: String, message: String },
    shippingAddress: { type: AddressSnapshotSchema, required: true },
    deliveryDate: Date,
    substitutions: [{ productName: String, substitutedWith: String, reason: String }],
    status: {
      type: String,
      enum: [
        'pending_payment',
        'paid',
        'in_production',
        'packed',
        'dispatched',
        'out_for_delivery',
        'delivered',
        'partially_delivered',
        'failed',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
    },
    trackingId: String,
    courier: String,
  },
  { _id: true },
);

const OrderSchema = new Schema<IOrder>(
  {
    number: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestEmail: { type: String, lowercase: true, trim: true },
    guestPhone: String,
    type: {
      type: String,
      enum: ['individual', 'corporate', 'wedding', 'custom'],
      default: 'individual',
      index: true,
    },
    lines: { type: [OrderLineSchema], required: true },
    subtotalINR: { type: Number, required: true },
    taxINR: { type: Number, default: 0 },
    shippingINR: { type: Number, default: 0 },
    discountINR: { type: Number, default: 0 },
    totalINR: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    coupon: String,

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'authorized', 'captured', 'refunded', 'failed'],
      default: 'unpaid',
      index: true,
    },
    paymentProvider: { type: String, enum: ['razorpay', 'manual', 'cod'] },
    paymentMeta: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      invoiceUrl: String,
      gstInvoiceNumber: String,
    },

    status: {
      type: String,
      enum: [
        'pending_payment',
        'paid',
        'in_production',
        'packed',
        'dispatched',
        'out_for_delivery',
        'delivered',
        'partially_delivered',
        'failed',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: String,
        by: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    corporate: {
      poNumber: String,
      approvedBy: String,
      branding: { logoUrl: String, noteCopy: String },
      splitByAddress: Boolean,
    },

    notes: String,
    cancelledReason: String,
  },
  { timestamps: true },
);

OrderSchema.pre('validate', function (next) {
  if (!this.number) this.number = orderNumber();
  next();
});

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'paymentMeta.razorpayOrderId': 1 });

export const Order = model<IOrder>('Order', OrderSchema);
