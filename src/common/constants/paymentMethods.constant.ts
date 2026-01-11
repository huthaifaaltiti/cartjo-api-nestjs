export const PaymentMethods = {
  CASH: { labelAr: "الدفع عند الاستلام", labelEn: "Cash on Delivery" },
  CARD: { labelAr: "الدفع الإلكتروني", labelEn: "Payment Card" },
} as const;

export type PaymentMethodKey = keyof typeof PaymentMethods;
