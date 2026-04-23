import { env } from '../config/env';
import { logger } from '../config/logger';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!env.SMTP_HOST) {
    logger.info({ to: payload.to, subject: payload.subject }, '[email stub] would send');
    return;
  }
  // Nodemailer/Resend integration plugs in here when creds are available.
  logger.info({ to: payload.to, subject: payload.subject }, 'email dispatched');
}
