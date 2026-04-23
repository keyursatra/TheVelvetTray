import { Schema, model, type Document, type Types } from 'mongoose';
import { toSlug } from '../utils/slugify';

export interface CraftStory {
  heading: string;
  body: string;
  image?: string;
}

export interface IRegion extends Document {
  _id: Types.ObjectId;
  name: string;               // "Kashmir"
  slug: string;               // "kashmir"
  state: string;              // "Jammu & Kashmir"
  craft: string;              // "Pashmina"
  material?: string;          // "Changthangi goat wool"
  heroImage?: string;
  mapCoords?: { lat: number; lng: number };
  shortIntro: string;         // 1-2 lines used on the atlas tile
  longStory: string;          // editorial long-form
  stories?: CraftStory[];     // additional vignettes
  products?: Types.ObjectId[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RegionSchema = new Schema<IRegion>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    state: { type: String, required: true },
    craft: { type: String, required: true },
    material: String,
    heroImage: String,
    mapCoords: { lat: Number, lng: Number },
    shortIntro: { type: String, required: true },
    longStory: { type: String, required: true },
    stories: [
      {
        heading: { type: String, required: true },
        body: { type: String, required: true },
        image: String,
      },
    ],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    order: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

RegionSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = toSlug(this.name);
  next();
});

export const Region = model<IRegion>('Region', RegionSchema);
