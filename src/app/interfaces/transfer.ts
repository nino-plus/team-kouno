import Stripe from 'stripe';

export interface TransferWithCharge
  extends Omit<Stripe.Transfer, 'destination_payment'> {
  destination_payment: Stripe.Charge;
}
