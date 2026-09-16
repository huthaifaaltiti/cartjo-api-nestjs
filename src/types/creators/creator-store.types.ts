import { HandleAvailability } from '../../enums/handleAvailability.enum';
import { PreferredLanguage } from '../../enums/preferredLanguage.enum';

/** Store owner's contact details used to address a notification email. */
export interface StoreOwnerContact {
  email: string;
  firstName: string;
  prefLang: PreferredLanguage;
}

/** Outcome of a handle availability check, with a client-safe message. */
export interface HandleAvailabilityCheck {
  reason: HandleAvailability;
  /** `true` only when the handle is free to take. */
  available: boolean;
  /** Human-readable, localized explanation — safe to surface to the client. */
  message: string;
}

/** {@link HandleAvailabilityCheck} plus the handle it was run for. */
export interface HandleAvailabilityResult extends HandleAvailabilityCheck {
  handle: string;
}

/** Response body of `PUT creator-store/change-handle`. */
export interface HandleChangeResult {
  handle: string;
  previousHandle: string | null;
  /** ISO timestamp of this change. */
  handleChangedAt: string;
  /**
   * ISO timestamp when the next change becomes allowed, or `null` while the
   * store is still in `DRAFT` (renames are free until the store goes live).
   */
  nextChangeAllowedAt: string | null;
  /** Number of non-DRAFT handle changes so far. */
  changeCount: number;
  /** The configured cooldown, echoed so the client can render a countdown. */
  cooldownDays: number;
}

/**
 * `details` payload attached to the 400 thrown when the cooldown is still
 * active, so the client can show an exact "try again on <date>" message.
 */
export interface HandleChangeCooldownDetails {
  nextChangeAllowedAt: string;
  cooldownDays: number;
}

export interface AdminStoreCounts {
  all: number;
  pending: number;
  approved: number;
  suspended: number;
  unverified: number;
}
