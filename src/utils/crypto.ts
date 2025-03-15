import crypto from 'crypto';

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashPassword(password: string): string {
  return sha256(password + process.env.PASSWORD_SECRET);
}