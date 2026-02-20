export function generateSecureStamp(): string {
  return (
    Math.random().toString(36).substring(2, 7) +
    Date.now().toString() +
    Math.random().toString(36).substring(2)
  );
}
