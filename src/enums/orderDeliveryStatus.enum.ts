import { Statuses } from './statuses.enum';

export enum OrderDeliveryStatus {
  PENDING = Statuses.PENDING, // Order created, not prepared for delivery
  CONFIRMED = Statuses.CONFIRMED, // Delivery confirmed / assigned
  PREPARING = Statuses.PREPARING, // Being prepared for shipment
  SHIPPED = Statuses.SHIPPED, // Handed to courier / out for delivery
  OUT_FOR_DELIVERY = Statuses.OUT_FOR_DELIVERY, // Courier on the way
  DELIVERED = Statuses.DELIVERED, // Successfully delivered
  FAILED = Statuses.FAILED, // Delivery attempt failed
  RETURNED = Statuses.RETURNED, // Returned to warehouse
  CANCELED = Statuses.CANCELED, // Delivery canceled
}
