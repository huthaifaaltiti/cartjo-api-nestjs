<<<<<<< HEAD
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
=======
import { Statuses } from './statuses.enum';

export enum PaymentStatus {
  PENDING = Statuses.PENDING,
  PAID = Statuses.PAID,
  FAILED = Statuses.FAILED,
  REFUNDED = Statuses.REFUNDED,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
}
