export enum HandleAvailability {
  /** Free to take. */
  AVAILABLE = 'AVAILABLE',
  /** Fails the format rules (length / allowed characters / shape). */
  INVALID = 'INVALID',
  /** Already this store's current handle — nothing to change. */
  CURRENT = 'CURRENT',
  /** In active use by another store. */
  TAKEN = 'TAKEN',
  /** On the platform reserved list. */
  RESERVED = 'RESERVED',
  /** Released by another store too recently to be reclaimed yet. */
  RECENTLY_RELEASED = 'RECENTLY_RELEASED',
}
