import * as functions from 'firebase-functions';
import Stripe from 'stripe';

export const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2020-08-27',
});
