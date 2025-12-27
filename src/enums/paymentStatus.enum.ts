import { Statuses } from './statuses.enum';

export enum PaymentStatus {
  PENDING = Statuses.PENDING,
  PAID = Statuses.PAID,
  FAILED = Statuses.FAILED,
  REFUNDED = Statuses.REFUNDED,
}
