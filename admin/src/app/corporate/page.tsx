'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, formatDate, formatINR } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Enquiry {
  _id: string;
  reference: string;
  contact: { name: string; email: string; phone: string; company: string };
  recipientCount?: number;
  budgetINR?: { min?: number; max?: number };
  status: string;
  createdAt: string;
}

export default function EnquiriesPage() {
  const [list, setList] = useState<Enquiry[]>([]);
  const [status, setStatus] = useState('');

  const load = async () => {
    const q = status ? `?status=${status}` : '';
    try { setList(await api<Enquiry[]>(`/corporate/enquiries${q}`)); } catch { /* */ }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  useEffect(() => {
    const s = getSocket();
    const reload = () => load();
    s.on('enquiry:new', reload);
    s.on('enquiry:update', reload);
    return () => {
      s.off('enquiry:new', reload);
      s.off('enquiry:update', reload);
    };
    /* eslint-disable-next-line */
  }, []);

  const update = async (id: string, newStatus: string) => {
    await api(`/corporate/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  const statuses = ['', 'new', 'in_review', 'quoted', 'approved', 'in_production', 'closed', 'lost'];

  return (
    <Shell>
      <div className="p-8">
        <div className="eyebrow text-gold-700">Corporate</div>
        <h1 className="font-serif text-4xl mt-1">Enquiries</h1>

        <div className="mt-6 flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider border rounded-sm ${status === s ? 'bg-ink text-ivory border-ink' : 'border-ink/20 hover:border-ink'}`}
            >
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>

        <div className="card mt-6 overflow-hidden">
          <table className="table w-full">
            <thead><tr><th>Reference</th><th>Company</th><th>Contact</th><th>Recipients</th><th>Budget</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e._id}>
                  <td className="font-mono">{e.reference}</td>
                  <td>{e.contact.company}</td>
                  <td>
                    <div>{e.contact.name}</div>
                    <div className="text-xs text-ink-50">{e.contact.email}</div>
                  </td>
                  <td>{e.recipientCount ?? '—'}</td>
                  <td>
                    {e.budgetINR?.min || e.budgetINR?.max
                      ? `${e.budgetINR.min ? formatINR(e.budgetINR.min) : ''} – ${e.budgetINR.max ? formatINR(e.budgetINR.max) : ''}`
                      : '—'}
                  </td>
                  <td>
                    <select
                      value={e.status}
                      onChange={(ev) => update(e._id, ev.target.value)}
                      className="text-xs border border-ink/20 rounded-sm px-2 py-1 bg-white"
                    >
                      {['new', 'in_review', 'quoted', 'approved', 'in_production', 'dispatched', 'closed', 'lost'].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-xs text-ink-50">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-ink-50">No enquiries.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
