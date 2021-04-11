export interface Customer {
  userId: string;
  customerId: string;
  paymentMethods: string[];
  defaultPaymentMethod: string;
}
