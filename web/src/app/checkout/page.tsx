'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { api, formatINR } from '@/lib/api';

interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

type Step = 'contact' | 'shipping' | 'gifting' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [address, setAddress] = useState<AddressInput>({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'IN',
  });
  const [note, setNote] = useState({ to: '', from: '', message: '' });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = subtotal();
  const tax = Math.round(total * 0.18);
  const shipping = total >= 2500 ? 0 : 120;
  const grand = total + tax + shipping;

  if (lines.length === 0) {
    return (
      <div className="container py-24 text-center">
        <p className="font-serif text-2xl">Your tray is empty.</p>
        <Link href="/hampers" className="btn-primary mt-6 inline-flex">Explore trays</Link>
      </div>
    );
  }

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        type: 'individual',
        guestEmail: contact.email,
        guestPhone: contact.phone,
        lines: lines.map((l) => ({
          hamperId: l.hamperId,
          quantity: l.quantity,
          shippingAddress: { ...address, phone: address.phone || contact.phone, name: address.name || note.to || 'Recipient' },
          giftNote: note.message ? note : undefined,
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        })),
      };
      const data = await api<{ order: { _id: string; number: string; totalINR: number }; payment: { orderId: string; amount: number; currency: string } | null }>(
        '/orders',
        { method: 'POST', body: JSON.stringify(payload) },
      );
      clear();
      if (data.payment && typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
        // Razorpay checkout would be opened here when keys are configured.
        router.push(`/track-order?number=${data.order.number}`);
      } else {
        router.push(`/track-order?number=${data.order.number}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="eyebrow text-gold-700">Checkout</div>
      <h1 className="mt-3 font-serif text-display">A few details.</h1>

      <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <div>
          <Stepper step={step} />

          {step === 'contact' && (
            <Panel title="Your contact">
              <Input label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
              <Input label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
              <div className="mt-6">
                <button className="btn-primary" onClick={() => setStep('shipping')} disabled={!contact.email || !contact.phone}>
                  Continue
                </button>
              </div>
            </Panel>
          )}

          {step === 'shipping' && (
            <Panel title="Shipping address">
              <Input label="Recipient name" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} />
              <Input label="Recipient phone" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
              <Input label="Address line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} />
              <Input label="Address line 2" value={address.line2 ?? ''} onChange={(v) => setAddress({ ...address, line2: v })} />
              <div className="grid md:grid-cols-3 gap-6">
                <Input label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                <Input label="PIN" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
              </div>
              <div className="mt-6 flex gap-3">
                <button className="btn-ghost" onClick={() => setStep('contact')}>Back</button>
                <button
                  className="btn-primary"
                  onClick={() => setStep('gifting')}
                  disabled={!address.line1 || !address.city || !address.pincode}
                >
                  Continue
                </button>
              </div>
            </Panel>
          )}

          {step === 'gifting' && (
            <Panel title="Gifting details">
              <Input label="To (recipient)" value={note.to} onChange={(v) => setNote({ ...note, to: v })} />
              <Input label="From" value={note.from} onChange={(v) => setNote({ ...note, from: v })} />
              <label className="block">
                <span className="eyebrow text-ink-50 block mb-2">Message</span>
                <textarea
                  rows={3}
                  className="input resize-none"
                  value={note.message}
                  maxLength={220}
                  onChange={(e) => setNote({ ...note, message: e.target.value })}
                />
                <span className="text-xs text-ink-50 mt-1">Up to 220 characters, handwritten onto our card.</span>
              </label>
              <Input label="Preferred delivery date (optional)" type="date" value={deliveryDate} onChange={setDeliveryDate} />
              <div className="mt-6 flex gap-3">
                <button className="btn-ghost" onClick={() => setStep('shipping')}>Back</button>
                <button className="btn-primary" onClick={() => setStep('review')}>Review</button>
              </div>
            </Panel>
          )}

          {step === 'review' && (
            <Panel title="Review and place">
              <dl className="grid md:grid-cols-2 gap-5 text-sm">
                <SummaryItem k="Contact" v={`${contact.email} · ${contact.phone}`} />
                <SummaryItem k="Recipient" v={`${address.name}, ${address.line1}, ${address.city}, ${address.pincode}`} />
                {note.message && <SummaryItem k="Note" v={`“${note.message}”`} />}
                {deliveryDate && <SummaryItem k="Delivery date" v={deliveryDate} />}
              </dl>
              {error && <p className="mt-4 text-crimson text-sm">{error}</p>}
              <div className="mt-8 flex gap-3">
                <button className="btn-ghost" onClick={() => setStep('gifting')}>Back</button>
                <button className="btn-primary" onClick={placeOrder} disabled={submitting}>
                  {submitting ? 'Placing…' : `Place order · ${formatINR(grand)}`}
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-50">
                Payment is processed securely via Razorpay. An invoice is emailed after capture.
              </p>
            </Panel>
          )}
        </div>

        <aside className="card-tray p-8 h-fit">
          <div className="eyebrow text-gold-700">Your tray</div>
          <ul className="mt-5 divide-y divide-ink/10">
            {lines.map((l, i) => (
              <li key={i} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <div className="font-serif text-lg">{l.name}</div>
                  <div className="text-ink-50">× {l.quantity}</div>
                </div>
                <div className="font-serif">{formatINR(l.priceINR * l.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm">
            <Row k="Subtotal" v={formatINR(total)} />
            <Row k="GST (18%)" v={formatINR(tax)} />
            <Row k="Shipping" v={shipping === 0 ? 'Complimentary' : formatINR(shipping)} />
            <div className="pt-3 border-t border-ink/10 flex justify-between">
              <div className="font-serif text-xl">Total</div>
              <div className="font-serif text-xl">{formatINR(grand)}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: Step[] = ['contact', 'shipping', 'gifting', 'review'];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((s, i) => (
        <div key={s} className={`flex-1 h-px ${i <= idx ? 'bg-crimson' : 'bg-ink/20'}`} />
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-tray p-8">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink-50 block mb-2">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-70">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function SummaryItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eyebrow text-ink-50">{k}</dt>
      <dd className="mt-1">{v}</dd>
    </div>
  );
}
