export function generateSecureStamp(): string {
  return (
    crypto.randomUUID().substring(2, 8) +
    Math.random().toString(36).substring(2, 7) +
    Date.now().toString().slice(-5) +
    Math.random().toString(36).substring(2, 4) +
    crypto.randomUUID().substring(2, 8)
  );
}
