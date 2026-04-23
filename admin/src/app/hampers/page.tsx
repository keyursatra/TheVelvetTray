'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, formatINR } from '@/lib/api';

interface Hamper { _id: string; name: string; slug: string; tier: string; priceINR: number; isActive: boolean; isFeatured: boolean }

export default function HampersPage() {
  const [hampers, setHampers] = useState<Hamper[]>([]);

  const load = async () => {
    try { setHampers(await api<Hamper[]>('/hampers?limit=48')); } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const toggleFeatured = async (h: Hamper) => {
    await api(`/hampers/${h._id}`, { method: 'PATCH', body: JSON.stringify({ isFeatured: !h.isFeatured }) });
    load();
  };

  return (
    <Shell>
      <div className="p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow text-gold-700">Catalog</div>
            <h1 className="font-serif text-4xl mt-1">Hampers</h1>
          </div>
          <button className="btn-primary" disabled title="Compose a new hamper (form to follow)">+ New hamper</button>
        </div>

        <div className="card mt-6 overflow-hidden">
          <table className="table w-full">
            <thead><tr><th>Name</th><th>Tier</th><th>Price</th><th>Featured</th><th>Status</th></tr></thead>
            <tbody>
              {hampers.map((h) => (
                <tr key={h._id}>
                  <td className="font-serif text-base">{h.name}</td>
                  <td className="capitalize">{h.tier}</td>
                  <td>{formatINR(h.priceINR)}</td>
                  <td>
                    <button onClick={() => toggleFeatured(h)} className={`pill ${h.isFeatured ? 'bg-gold/20 text-gold-700' : 'bg-ink/10'}`}>
                      {h.isFeatured ? 'Featured' : 'Regular'}
                    </button>
                  </td>
                  <td><span className={`pill ${h.isActive ? 'bg-green-100 text-green-800' : 'bg-ink/10'}`}>{h.isActive ? 'Active' : 'Archived'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
