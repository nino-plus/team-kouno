import Stripe from 'stripe';

export interface ChargeWithInvoice extends Omit<Stripe.Charge, 'invoice'> {
  invoice: {
    lines: {
      data: Stripe.Invoice[];
    };
  };
}
