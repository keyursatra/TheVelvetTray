export type HamperTier = 'signature' | 'heritage' | 'atelier' | 'noir';

export interface Hamper {
  _id: string;
  name: string;
  slug: string;
  tier: HamperTier;
  tagline?: string;
  story: string;
  origin?: string;
  priceINR: number;
  compareAtINR?: number;
  heroImage?: string;
  images: { url: string; alt?: string }[];
  items: { product: string | Product; quantity: number; categoryLabel: string; substitutable: boolean }[];
  occasions: (string | Occasion)[];
  recipientTags: string[];
  leadTimeDays: { min: number; max: number };
  customization: CustomizationOption[];
  minOrderQty: number;
  isFeatured: boolean;
  effectiveStock?: number;
}

export interface CustomizationOption {
  key: 'monogram' | 'note' | 'ribbon' | 'box-colour' | 'logo' | 'recipient-name' | 'language';
  label: string;
  required: boolean;
  values?: string[];
  maxLength?: number;
  priceDeltaINR?: number;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  origin?: string;
  priceINR: number;
  stock: number;
  images: { url: string; alt?: string }[];
}

export interface Occasion {
  _id: string;
  name: string;
  slug: string;
  shortLabel: string;
  tagline?: string;
  tone?: string;
  heroImage?: string;
  order: number;
}

export interface Region {
  _id: string;
  name: string;
  slug: string;
  state: string;
  craft: string;
  material?: string;
  shortIntro: string;
  longStory: string;
  heroImage?: string;
  mapCoords?: { lat: number; lng: number };
}
