'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; reference: string }
  | { kind: 'error'; message: string };

export function CorporateForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ kind: 'submitting' });
    const form = new FormData(e.currentTarget);
    const payload = {
      contact: {
        name: String(form.get('name') || ''),
        designation: String(form.get('designation') || '') || undefined,
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        company: String(form.get('company') || ''),
        gstin: String(form.get('gstin') || '') || undefined,
      },
      recipientCount: Number(form.get('recipientCount')) || undefined,
      budgetINR: {
        min: Number(form.get('budgetMin')) || undefined,
        max: Number(form.get('budgetMax')) || undefined,
      },
      targetDeliveryDate: (form.get('targetDeliveryDate') as string) || undefined,
      brandingRequired: form.get('branding') === 'on',
      brandingNotes: String(form.get('brandingNotes') || '') || undefined,
      shippingMode: (form.get('shippingMode') as 'single' | 'multi') || 'single',
      notes: String(form.get('notes') || '') || undefined,
    };

    try {
      const data = await api<{ reference: string; id: string; status: string }>(
        '/corporate/enquiries',
        { method: 'POST', body: JSON.stringify(payload) },
      );
      setState({ kind: 'success', reference: data.reference });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  if (state.kind === 'success') {
    return (
      <div className="mt-8 card-tray p-10">
        <div className="eyebrow text-gold-700">Received</div>
        <h3 className="mt-3 font-serif text-3xl">Thank you.</h3>
        <p className="mt-3 text-ink-70 leading-relaxed">
          Our concierge will respond within one working day with curated options.
        </p>
        <div className="mt-6 eyebrow text-ink-50">
          Reference · <span className="text-ink">{state.reference}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field name="name" label="Your name" required />
        <Field name="designation" label="Designation" />
        <Field name="email" label="Work email" type="email" required />
        <Field name="phone" label="Phone" required />
        <Field name="company" label="Company" required />
        <Field name="gstin" label="GSTIN (optional)" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Field name="recipientCount" label="Recipients" type="number" />
        <Field name="budgetMin" label="Budget min (per gift, ₹)" type="number" />
        <Field name="budgetMax" label="Budget max (per gift, ₹)" type="number" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field name="targetDeliveryDate" label="Target delivery date" type="date" />
        <div>
          <label className="eyebrow text-ink-50 block mb-2">Shipping</label>
          <select name="shippingMode" className="input">
            <option value="single">Single pickup address</option>
            <option value="multi">Multiple recipient addresses</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="branding" className="w-4 h-4 accent-crimson" />
        <span className="text-sm">We'd like company logo / brand monogramming</span>
      </label>
      <Field name="brandingNotes" label="Branding notes (optional)" textarea />

      <Field name="notes" label="Anything else we should know" textarea />

      {state.kind === 'error' && (
        <div className="text-crimson text-sm">{state.message}</div>
      )}

      <div>
        <button
          type="submit"
          className="btn-primary"
          disabled={state.kind === 'submitting'}
        >
          {state.kind === 'submitting' ? 'Sending…' : 'Request a quote'}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink-50 block mb-2">
        {label}
        {required && <span className="text-crimson ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={3} className="input resize-none" />
      ) : (
        <input name={name} type={type} required={required} className="input" />
      )}
    </label>
  );
}
