import { Schema, model, type Document, type Types } from 'mongoose';
import { toSlug } from '../utils/slugify';

export type ProductCategory =
  | 'edible'
  | 'beverages'
  | 'textiles'
  | 'stationery'
  | 'wellness'
  | 'executive'
  | 'packaging'
  | 'add-ons';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description?: string;
  origin?: string;            // "Kutch, Gujarat"
  region?: Types.ObjectId;    // ref Region
  material?: string;          // "Mulberry silk"
  makers?: string;            // "Karigars of Bhujodi"
  priceINR: number;           // standalone price if sold as add-on
  stock: number;
  lowStockThreshold: number;
  substitutes: Types.ObjectId[]; // fallback products for OOS
  images: { url: string; alt?: string }[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: {
      type: String,
      enum: ['edible', 'beverages', 'textiles', 'stationery', 'wellness', 'executive', 'packaging', 'add-ons'],
      required: true,
      index: true,
    },
    description: String,
    origin: String,
    region: { type: Schema.Types.ObjectId, ref: 'Region' },
    material: String,
    makers: String,
    priceINR: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    substitutes: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    images: [{ url: { type: String, required: true }, alt: String }],
    tags: { type: [String], index: true, default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

ProductSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = toSlug(this.name);
  next();
});

ProductSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

ProductSchema.virtual('isOutOfStock').get(function () {
  return this.stock <= 0;
});

ProductSchema.set('toJSON', { virtuals: true });

export const Product = model<IProduct>('Product', ProductSchema);
