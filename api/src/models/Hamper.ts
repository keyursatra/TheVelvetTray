import { Schema, model, type Document, type Types } from 'mongoose';
import { toSlug } from '../utils/slugify';

export type HamperTier = 'signature' | 'heritage' | 'atelier' | 'noir';
// signature = entry-premium; heritage = mid; atelier = high; noir = bespoke top-tier

export interface HamperItem {
  product: Types.ObjectId;
  quantity: number;
  categoryLabel: string; // printed grouping: "Edible · Sweet", "Textile", "Stationery"
  substitutable: boolean;
}

export interface CustomizationOption {
  key: 'monogram' | 'note' | 'ribbon' | 'box-colour' | 'logo' | 'recipient-name' | 'language';
  label: string;
  required: boolean;
  values?: string[];
  maxLength?: number;
  priceDeltaINR?: number;
}

export interface IHamper extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  tier: HamperTier;
  tagline?: string;
  story: string;                  // "Why it exists" — editorial paragraph
  origin?: string;                // italicised on site
  priceINR: number;
  compareAtINR?: number;          // strikethrough for promotions (used rarely)
  currency: 'INR';
  items: HamperItem[];
  customization: CustomizationOption[];
  occasions: Types.ObjectId[];
  recipientTags: string[];        // "executive", "client", "bride", "teacher"
  images: { url: string; alt?: string }[];
  heroImage?: string;
  leadTimeDays: { min: number; max: number };
  pincodesAvailable?: string[];
  isFeatured: boolean;
  isActive: boolean;
  stockOverride?: number;         // cap stock independent of items
  minOrderQty: number;            // for corporate (e.g. 25)
  seo?: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const HamperItemSchema = new Schema<HamperItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    categoryLabel: { type: String, required: true },
    substitutable: { type: Boolean, default: true },
  },
  { _id: false },
);

const CustomizationSchema = new Schema<CustomizationOption>(
  {
    key: {
      type: String,
      enum: ['monogram', 'note', 'ribbon', 'box-colour', 'logo', 'recipient-name', 'language'],
      required: true,
    },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    values: [String],
    maxLength: Number,
    priceDeltaINR: { type: Number, default: 0 },
  },
  { _id: false },
);

const HamperSchema = new Schema<IHamper>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    tier: {
      type: String,
      enum: ['signature', 'heritage', 'atelier', 'noir'],
      required: true,
      index: true,
    },
    tagline: String,
    story: { type: String, required: true },
    origin: String,
    priceINR: { type: Number, required: true, min: 0, index: true },
    compareAtINR: Number,
    currency: { type: String, default: 'INR' },
    items: { type: [HamperItemSchema], default: [] },
    customization: { type: [CustomizationSchema], default: [] },
    occasions: [{ type: Schema.Types.ObjectId, ref: 'Occasion', index: true }],
    recipientTags: { type: [String], index: true, default: [] },
    images: [{ url: { type: String, required: true }, alt: String }],
    heroImage: String,
    leadTimeDays: {
      min: { type: Number, default: 2 },
      max: { type: Number, default: 5 },
    },
    pincodesAvailable: [String],
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    stockOverride: Number,
    minOrderQty: { type: Number, default: 1 },
    seo: {
      title: String,
      description: String,
    },
  },
  { timestamps: true },
);

HamperSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = toSlug(this.name);
  next();
});

// Effective stock = min(stockOverride, min(item.stock / item.quantity))
HamperSchema.virtual('effectiveStock', {
  ref: 'Product',
  localField: 'items.product',
  foreignField: '_id',
  justOne: false,
});

HamperSchema.set('toJSON', { virtuals: true });

export const Hamper = model<IHamper>('Hamper', HamperSchema);
