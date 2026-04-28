import type { HamperTier } from '../models/Hamper';

interface HamperSeedItem {
  sku: string;
  quantity: number;
  categoryLabel: string;
  substitutable?: boolean;
}

interface HamperSeed {
  name: string;
  slug: string;
  tier: HamperTier;
  tagline: string;
  story: string;
  origin?: string;
  priceINR: number;
  items: HamperSeedItem[];
  occasions: string[]; // slugs
  recipientTags: string[];
  leadTimeDays: { min: number; max: number };
  isFeatured?: boolean;
  minOrderQty?: number;
  customization?: { key: string; label: string; required: boolean; maxLength?: number; priceDeltaINR?: number }[];
}

export const hampersSeed: HamperSeed[] = [
  {
    name: 'The Roshni Tray',
    slug: 'the-roshni-tray',
    tier: 'heritage',
    tagline: 'A Diwali kept in quiet reverence.',
    story:
      'Roshni begins the way our Diwalis once did — with saffron warmed in milk, a letter written by hand, and sweets shared slowly. We paired single-origin mithai with Kannauj attar and a small Channapatna oil lamp, because festivals of light were never meant to be rushed.',
    origin: 'Kashmir · Kannauj · Channapatna · Varanasi',
    priceINR: 4800,
    items: [
      { sku: 'ED-KES-001', quantity: 1, categoryLabel: 'Edible · Saffron' },
      { sku: 'ED-MIT-001', quantity: 1, categoryLabel: 'Edible · Mithai' },
      { sku: 'ED-CHO-001', quantity: 1, categoryLabel: 'Edible · Chocolate', substitutable: true },
      { sku: 'WL-ATR-001', quantity: 1, categoryLabel: 'Wellness · Attar' },
      { sku: 'EX-DSK-001', quantity: 1, categoryLabel: 'Executive · Object', substitutable: true },
      { sku: 'PK-TRY-001', quantity: 1, categoryLabel: 'Packaging · Tray' },
      { sku: 'AD-CRD-001', quantity: 1, categoryLabel: 'Add-on · Note' },
    ],
    occasions: ['diwali', 'thank-you'],
    recipientTags: ['family', 'client', 'executive'],
    leadTimeDays: { min: 3, max: 6 },
    isFeatured: true,
    customization: [
      { key: 'note', label: 'Handwritten note', required: false, maxLength: 160 },
      { key: 'monogram', label: 'Monogram on tray', required: false, priceDeltaINR: 350 },
    ],
  },
  {
    name: 'The Atelier Noir',
    slug: 'the-atelier-noir',
    tier: 'noir',
    tagline: 'Reserved for the quiet kind of celebration.',
    story:
      'Our most considered tray — a hand-loomed pashmina folded beside single-estate Darjeeling, a brass fountain pen and letterpress stationery. Noir is less a hamper than a small ceremony, presented in a velvet-lined wooden chest.',
    origin: 'Srinagar · Goomtee Estate · Jaipur · Pondicherry',
    priceINR: 18500,
    items: [
      { sku: 'TX-PSH-001', quantity: 1, categoryLabel: 'Textile · Pashmina', substitutable: false },
      { sku: 'BV-TEA-001', quantity: 1, categoryLabel: 'Beverage · Tea' },
      { sku: 'EX-PEN-001', quantity: 1, categoryLabel: 'Executive · Pen' },
      { sku: 'ST-NTB-001', quantity: 1, categoryLabel: 'Stationery · Notebook' },
      { sku: 'ST-LTR-001', quantity: 1, categoryLabel: 'Stationery · Cards' },
      { sku: 'PK-TRY-002', quantity: 1, categoryLabel: 'Packaging · Tray' },
    ],
    occasions: ['weddings', 'client-gifting', 'anniversaries'],
    recipientTags: ['executive', 'client', 'founder'],
    leadTimeDays: { min: 5, max: 8 },
    isFeatured: true,
    customization: [
      { key: 'monogram', label: 'Monogrammed pen', required: false, priceDeltaINR: 500 },
      { key: 'note', label: 'Letterpress note', required: false, maxLength: 200 },
    ],
  },
  {
    name: 'The Bandhan Tray',
    slug: 'the-bandhan-tray',
    tier: 'signature',
    tagline: 'A thread, a tradition, a tray.',
    story:
      'Raksha Bandhan, unhurried. A handwoven rakhi paired with dates, wild honey and a small Channapatna object — an offering that honours the gesture without overwhelming it.',
    origin: 'Kutch · Nilgiris · Channapatna',
    priceINR: 2400,
    items: [
      { sku: 'ED-DAT-001', quantity: 1, categoryLabel: 'Edible · Dates' },
      { sku: 'ED-HON-001', quantity: 1, categoryLabel: 'Edible · Honey' },
      { sku: 'ED-CHO-001', quantity: 1, categoryLabel: 'Edible · Chocolate', substitutable: true },
      { sku: 'TX-AJR-001', quantity: 1, categoryLabel: 'Textile · Pocket Square' },
      { sku: 'PK-TRY-001', quantity: 1, categoryLabel: 'Packaging · Tray' },
      { sku: 'AD-CRD-001', quantity: 1, categoryLabel: 'Add-on · Note' },
    ],
    occasions: ['raksha-bandhan', 'birthdays'],
    recipientTags: ['family', 'sibling'],
    leadTimeDays: { min: 2, max: 5 },
    isFeatured: true,
    customization: [
      { key: 'recipient-name', label: 'Recipient name on card', required: false, maxLength: 40 },
      { key: 'note', label: 'Handwritten note', required: false, maxLength: 160 },
    ],
  },
  {
    name: 'The Welcome Tray',
    slug: 'the-welcome-tray',
    tier: 'signature',
    tagline: 'A first-day gesture that stays.',
    story:
      'For the new joiner who walks in on a Monday and finds that someone thought of them. A refined desk object, single-origin coffee, a handmade notebook and a note — brand-monogrammed on request.',
    origin: 'Coorg · Pondicherry · Channapatna',
    priceINR: 2200,
    items: [
      { sku: 'BV-COF-001', quantity: 1, categoryLabel: 'Beverage · Coffee' },
      { sku: 'BV-CHA-001', quantity: 1, categoryLabel: 'Beverage · Chai', substitutable: true },
      { sku: 'ST-NTB-001', quantity: 1, categoryLabel: 'Stationery · Notebook' },
      { sku: 'EX-DSK-001', quantity: 1, categoryLabel: 'Executive · Desk', substitutable: true },
      { sku: 'PK-BOX-001', quantity: 1, categoryLabel: 'Packaging · Box' },
      { sku: 'AD-CRD-001', quantity: 1, categoryLabel: 'Add-on · Note' },
    ],
    occasions: ['employee-welcome', 'employee-appreciation'],
    recipientTags: ['employee', 'executive'],
    leadTimeDays: { min: 3, max: 7 },
    minOrderQty: 10,
    isFeatured: true,
    customization: [
      { key: 'logo', label: 'Company logo on notebook', required: false, priceDeltaINR: 200 },
      { key: 'note', label: 'Leadership note', required: false, maxLength: 220 },
    ],
  },
  {
    name: 'The Phera Tray',
    slug: 'the-phera-tray',
    tier: 'atelier',
    tagline: 'Keepsakes for the witnesses of a vow.',
    story:
      'A wedding favour that neither crowds nor shouts — a Banarasi runner, attar, mithai and a letterpress card bearing the couple\'s initials. Packed in a velvet-lined tray that becomes a memory once unpacked.',
    origin: 'Varanasi · Kannauj · Pondicherry',
    priceINR: 5800,
    items: [
      { sku: 'TX-BAN-001', quantity: 1, categoryLabel: 'Textile · Runner', substitutable: false },
      { sku: 'WL-ATR-002', quantity: 1, categoryLabel: 'Wellness · Attar' },
      { sku: 'ED-MIT-001', quantity: 1, categoryLabel: 'Edible · Mithai' },
      { sku: 'ST-LTR-001', quantity: 1, categoryLabel: 'Stationery · Cards' },
      { sku: 'PK-TRY-002', quantity: 1, categoryLabel: 'Packaging · Tray' },
    ],
    occasions: ['weddings', 'anniversaries'],
    recipientTags: ['guest', 'family'],
    leadTimeDays: { min: 7, max: 14 },
    minOrderQty: 25,
    customization: [
      { key: 'monogram', label: 'Couple initials (letterpress)', required: true, maxLength: 6 },
      { key: 'note', label: 'Message on card', required: false, maxLength: 180 },
    ],
  },
  {
    name: 'The Essential Tray',
    slug: 'the-essential-tray',
    tier: 'signature',
    tagline: 'The house, in its simplest form.',
    story:
      'A quiet introduction to our sourcing — Darjeeling first flush, Coorg coffee, wild honey and a handmade notebook. Everything thoughtful; nothing surplus.',
    origin: 'Darjeeling · Coorg · Nilgiris · Pondicherry',
    priceINR: 1850,
    items: [
      { sku: 'BV-TEA-001', quantity: 1, categoryLabel: 'Beverage · Tea' },
      { sku: 'BV-COF-001', quantity: 1, categoryLabel: 'Beverage · Coffee' },
      { sku: 'ED-HON-001', quantity: 1, categoryLabel: 'Edible · Honey' },
      { sku: 'ST-NTB-001', quantity: 1, categoryLabel: 'Stationery · Notebook' },
      { sku: 'PK-BOX-001', quantity: 1, categoryLabel: 'Packaging · Box' },
    ],
    occasions: ['thank-you', 'client-gifting', 'birthdays', 'housewarming'],
    recipientTags: ['client', 'friend', 'colleague'],
    leadTimeDays: { min: 2, max: 4 },
  },
];
