import { Request } from 'express';

export function getClientIp(req?: Request): string | null {
  if (!req) return null;

  // 1️⃣ Check proxy headers (Cloudflare / Nginx / ALB)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  // 2️⃣ Fallback to socket address
  let ip = req.socket?.remoteAddress || null;

  // 3️⃣ Normalize IPv6 localhost
  if (ip === '::1') return '127.0.0.1';

  // 4️⃣ Normalize IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (ip?.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
}
