import Stripe from 'stripe';

export interface PriceWithProduct extends Stripe.Price {
  product: Stripe.Product;
}
