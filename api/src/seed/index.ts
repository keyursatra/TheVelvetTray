import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { User } from '../models/User';
import { Occasion } from '../models/Occasion';
import { Region } from '../models/Region';
import { Product } from '../models/Product';
import { Hamper } from '../models/Hamper';
import { toSlug } from '../utils/slugify';
import { occasionsSeed } from './occasions';
import { regionsSeed } from './regions';
import { productsSeed } from './products';
import { hampersSeed } from './hampers';

async function run() {
  await connectDB();
  logger.info('Seeding…');

  // ─── Admin user ─────────────────────────────────────
  const adminHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: env.SEED_ADMIN_EMAIL },
    {
      $setOnInsert: {
        name: 'Concierge',
        email: env.SEED_ADMIN_EMAIL,
        passwordHash: adminHash,
        role: 'superadmin',
        isActive: true,
      },
    },
    { upsert: true, new: true },
  );
  logger.info({ email: env.SEED_ADMIN_EMAIL }, 'Admin ensured');

  // ─── Occasions ──────────────────────────────────────
  for (const o of occasionsSeed) {
    await Occasion.findOneAndUpdate({ slug: o.slug }, { $set: o }, { upsert: true, new: true });
  }
  logger.info({ count: occasionsSeed.length }, 'Occasions seeded');

  // ─── Regions ────────────────────────────────────────
  for (const r of regionsSeed) {
    await Region.findOneAndUpdate({ slug: r.slug }, { $set: r }, { upsert: true, new: true });
  }
  logger.info({ count: regionsSeed.length }, 'Regions seeded');

  // ─── Products ───────────────────────────────────────
  const regionBySlug = new Map<string, string>();
  const regions = await Region.find({}).select('_id slug name');
  for (const r of regions) regionBySlug.set(r.slug, String(r._id));

  for (const p of productsSeed) {
    const slug = toSlug(p.name);
    const regionSlug = guessRegionSlug(p.origin);
    await Product.findOneAndUpdate(
      { sku: p.sku },
      {
        $set: {
          ...p,
          slug,
          region: regionSlug ? regionBySlug.get(regionSlug) : undefined,
          images: [],
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );
  }
  logger.info({ count: productsSeed.length }, 'Products seeded');

  // ─── Hampers ────────────────────────────────────────
  const bySku = new Map<string, string>();
  const allProducts = await Product.find({}).select('_id sku');
  for (const p of allProducts) bySku.set(p.sku, String(p._id));

  const occSlugToId = new Map<string, string>();
  const allOccasions = await Occasion.find({}).select('_id slug');
  for (const o of allOccasions) occSlugToId.set(o.slug, String(o._id));

  for (const h of hampersSeed) {
    const items = h.items
      .map((i) => ({
        product: bySku.get(i.sku),
        quantity: i.quantity,
        categoryLabel: i.categoryLabel,
        substitutable: i.substitutable ?? true,
      }))
      .filter((i) => i.product);

    const occasions = h.occasions.map((s) => occSlugToId.get(s)).filter(Boolean);

    await Hamper.findOneAndUpdate(
      { slug: h.slug },
      {
        $set: {
          name: h.name,
          slug: h.slug,
          tier: h.tier,
          tagline: h.tagline,
          story: h.story,
          origin: h.origin,
          priceINR: h.priceINR,
          items,
          occasions,
          recipientTags: h.recipientTags,
          leadTimeDays: h.leadTimeDays,
          isFeatured: h.isFeatured ?? false,
          minOrderQty: h.minOrderQty ?? 1,
          customization: h.customization ?? [],
          images: [],
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );
  }
  logger.info({ count: hampersSeed.length }, 'Hampers seeded');

  await disconnectDB();
  logger.info('Seeding complete.');
  process.exit(0);
}

function guessRegionSlug(origin?: string): string | undefined {
  if (!origin) return undefined;
  const lookup: Record<string, string> = {
    kashmir: 'kashmir', pampore: 'kashmir', srinagar: 'kashmir',
    kutch: 'kutch', ajrakhpur: 'kutch',
    coorg: 'coorg',
    darjeeling: 'darjeeling', goomtee: 'darjeeling',
    varanasi: 'varanasi', banaras: 'varanasi',
    channapatna: 'channapatna',
    bikaner: 'bikaner',
    kannauj: 'kannauj',
    nagaland: 'nagaland',
    pondicherry: 'pondicherry', auroville: 'pondicherry',
    bhagalpur: 'bhagalpur',
    kerala: 'kerala', idukki: 'kerala', nilgiris: 'kerala',
  };
  const lower = origin.toLowerCase();
  for (const [needle, slug] of Object.entries(lookup)) {
    if (lower.includes(needle)) return slug;
  }
  return undefined;
}

run().catch((err) => {
  logger.fatal({ err }, 'Seed failed');
  process.exit(1);
});
