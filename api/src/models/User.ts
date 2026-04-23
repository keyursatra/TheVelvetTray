import { Schema, model, type Document, type Model, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'corporate' | 'admin' | 'superadmin';

export interface Address {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface GiftingReminder {
  label: string;        // "Anniversary", "Diwali", "Recipient birthday"
  date: Date;           // next occurrence
  recurrence?: 'yearly' | 'monthly' | 'none';
  recipientName?: string;
  note?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  addresses: Address[];
  savedHampers: Types.ObjectId[];
  reminders: GiftingReminder[];

  // Corporate-only
  company?: {
    legalName: string;
    brandName?: string;
    gstin?: string;
    pan?: string;
    billingAddress?: Address;
    logoUrl?: string;
    approvedBudgetINR?: number;
  };

  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(plain: string): Promise<boolean>;
}

const AddressSchema = new Schema<Address>(
  {
    label: String,
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'IN' },
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const ReminderSchema = new Schema<GiftingReminder>(
  {
    label: { type: String, required: true },
    date: { type: Date, required: true },
    recurrence: { type: String, enum: ['yearly', 'monthly', 'none'], default: 'yearly' },
    recipientName: String,
    note: String,
  },
  { _id: true },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['customer', 'corporate', 'admin', 'superadmin'],
      default: 'customer',
      index: true,
    },
    addresses: { type: [AddressSchema], default: [] },
    savedHampers: [{ type: Schema.Types.ObjectId, ref: 'Hamper' }],
    reminders: { type: [ReminderSchema], default: [] },
    company: {
      legalName: String,
      brandName: String,
      gstin: { type: String, trim: true, uppercase: true },
      pan: { type: String, trim: true, uppercase: true },
      billingAddress: AddressSchema,
      logoUrl: String,
      approvedBudgetINR: Number,
    },
    emailVerifiedAt: Date,
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
};

interface UserModel extends Model<IUser> {
  hashPassword(plain: string): Promise<string>;
}

export const User = model<IUser, UserModel>('User', UserSchema);
