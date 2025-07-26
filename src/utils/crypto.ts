import crypto from 'crypto';
import { envConfig } from '~/constants/config';

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashPassword(password: string): string {
  return sha256(password + envConfig.passwordSecret);
}