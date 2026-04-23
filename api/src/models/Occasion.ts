import { Schema, model, type Document, type Types } from 'mongoose';
import { toSlug } from '../utils/slugify';

export interface IOccasion extends Document {
  _id: Types.ObjectId;
  name: string;              // "Diwali"
  slug: string;              // "diwali"
  shortLabel: string;        // "Diwali"
  tagline?: string;          // "Light travels further with meaning."
  heroCopy?: string;
  tone?: 'festive' | 'ceremonial' | 'corporate' | 'personal' | 'seasonal';
  months?: number[];         // [10, 11] -> surfaced Oct/Nov
  heroImage?: string;
  palette?: { bg?: string; ink?: string; accent?: string };
  order: number;             // display order on listing
  isActive: boolean;
  seo?: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const OccasionSchema = new Schema<IOccasion>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shortLabel: { type: String, required: true },
    tagline: String,
    heroCopy: String,
    tone: {
      type: String,
      enum: ['festive', 'ceremonial', 'corporate', 'personal', 'seasonal'],
      default: 'festive',
    },
    months: [Number],
    heroImage: String,
    palette: { bg: String, ink: String, accent: String },
    order: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true, index: true },
    seo: { title: String, description: String },
  },
  { timestamps: true },
);

OccasionSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = toSlug(this.name);
  next();
});

export const Occasion = model<IOccasion>('Occasion', OccasionSchema);
