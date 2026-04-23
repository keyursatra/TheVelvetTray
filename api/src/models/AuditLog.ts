import { Schema, model, type Document, type Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actor?: Types.ObjectId;
  actorEmail?: string;
  action: string;            // "order.update", "hamper.create", "enquiry.quote"
  entity?: string;           // "Order"
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: String,
    action: { type: String, required: true, index: true },
    entity: String,
    entityId: String,
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
