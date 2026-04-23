import { Hamper, type IHamper } from '../models/Hamper';
import { Product } from '../models/Product';
import { emitAdmin } from './realtime.service';
import { logger } from '../config/logger';

/**
 * Effective stock of a hamper = floor(min over all non-substitutable items of product.stock / qty)
 * Substitutable items don't block availability (we fall back via Product.substitutes).
 */
export async function effectiveHamperStock(hamper: IHamper): Promise<number> {
  if (hamper.stockOverride !== undefined && hamper.stockOverride !== null) {
    return Math.max(0, hamper.stockOverride);
  }
  if (!hamper.items?.length) return 0;

  const productIds = hamper.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  let floor = Number.POSITIVE_INFINITY;
  for (const item of hamper.items) {
    const p = byId.get(String(item.product));
    if (!p) return 0;
    if (!item.substitutable) {
      const possible = Math.floor((p.stock ?? 0) / item.quantity);
      if (possible < floor) floor = possible;
    } else {
      // substitutable -> considered available (ops will swap)
      const possible = Math.floor(((p.stock ?? 0) + 9999) / item.quantity);
      if (possible < floor) floor = possible;
    }
  }
  return floor === Number.POSITIVE_INFINITY ? 0 : Math.max(0, floor);
}

/**
 * Decrement stock of underlying products after an order line is confirmed.
 * Returns substitutions list if OOS fallbacks were used.
 */
export async function consumeHamperStock(
  hamperId: string,
  quantity: number,
): Promise<{ ok: boolean; substitutions: { productName: string; substitutedWith: string; reason: string }[] }> {
  const hamper = await Hamper.findById(hamperId);
  if (!hamper) return { ok: false, substitutions: [] };

  const subs: { productName: string; substitutedWith: string; reason: string }[] = [];

  for (const item of hamper.items) {
    const required = item.quantity * quantity;
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (product.stock >= required) {
      product.stock -= required;
      await product.save();
      await notifyLowStock(product);
      continue;
    }

    if (item.substitutable && product.substitutes?.length) {
      const sub = await Product.findOne({ _id: { $in: product.substitutes }, stock: { $gte: required } });
      if (sub) {
        sub.stock -= required;
        await sub.save();
        await notifyLowStock(sub);
        subs.push({
          productName: product.name,
          substitutedWith: sub.name,
          reason: 'Primary item unavailable — equivalent substituted',
        });
        continue;
      }
    }

    // can't fulfill — let ops decide
    return { ok: false, substitutions: subs };
  }

  return { ok: true, substitutions: subs };
}

async function notifyLowStock(product: { _id: unknown; name: string; stock: number; lowStockThreshold: number }) {
  if (product.stock <= 0) {
    emitAdmin('stock:out', { productId: String(product._id), name: product.name });
    logger.warn({ product: product.name }, 'Product out of stock');
  } else if (product.stock <= product.lowStockThreshold) {
    emitAdmin('stock:low', { productId: String(product._id), name: product.name, stock: product.stock });
  }
}
