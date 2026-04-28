import { Schema, model, type Document, type Types } from 'mongoose';

export type EnquiryStatus =
  | 'new'
  | 'in_review'
  | 'quoted'
  | 'approved'
  | 'in_production'
  | 'dispatched'
  | 'closed'
  | 'lost';

export interface IEnquiry extends Document {
  _id: Types.ObjectId;
  reference: string;            // ENQ-YYYYMMDD-XXXX
  contact: {
    name: string;
    designation?: string;
    email: string;
    phone: string;
    company: string;
    gstin?: string;
  };
  budgetINR?: { min?: number; max?: number };
  recipientCount?: number;
  occasion?: Types.ObjectId;
  targetDeliveryDate?: Date;
  hampersOfInterest?: Types.ObjectId[];
  brandingRequired: boolean;
  brandingNotes?: string;
  shippingMode: 'single' | 'multi';
  addresses?: number;           // planning-stage count only
  notes?: string;
  status: EnquiryStatus;
  assignedTo?: Types.ObjectId;
  quoteAmountINR?: number;
  quoteDocUrl?: string;
  relatedOrders?: Types.ObjectId[];
  history: { status: EnquiryStatus; at: Date; by?: Types.ObjectId; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

function enquiryRef(): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 9000 + 1000).toString();
  return `ENQ-${ymd}-${rand}`;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    reference: { type: String, unique: true, index: true },
    contact: {
      name: { type: String, required: true },
      designation: String,
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
      company: { type: String, required: true },
      gstin: { type: String, uppercase: true, trim: true },
    },
    budgetINR: { min: Number, max: Number },
    recipientCount: Number,
    occasion: { type: Schema.Types.ObjectId, ref: 'Occasion' },
    targetDeliveryDate: Date,
    hampersOfInterest: [{ type: Schema.Types.ObjectId, ref: 'Hamper' }],
    brandingRequired: { type: Boolean, default: false },
    brandingNotes: String,
    shippingMode: { type: String, enum: ['single', 'multi'], default: 'single' },
    addresses: Number,
    notes: String,
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'approved', 'in_production', 'dispatched', 'closed', 'lost'],
      default: 'new',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    quoteAmountINR: Number,
    quoteDocUrl: String,
    relatedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    history: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

EnquirySchema.pre('validate', function (next) {
  if (!this.reference) this.reference = enquiryRef();
  next();
});

export const CorporateEnquiry = model<IEnquiry>('CorporateEnquiry', EnquirySchema);
