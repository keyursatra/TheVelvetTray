import slugifyLib from 'slugify';

export function toSlug(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export function orderNumber(): string {
  // VT-YYYYMMDD-XXXX  (human-friendly, time-ordered)
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 9000 + 1000).toString();
  return `VT-${ymd}-${rand}`;
}
