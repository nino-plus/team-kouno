import { stripe } from './client';
import Stripe from 'stripe';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const db = admin.firestore();

export const getStripeInvoices = functions
  .region('asia-northeast1')
  .https.onCall(
    async (
      data: {
        startingAfter?: string;
        endingBefore?: string;
      },
      context
    ): Promise<Stripe.ApiList<Stripe.Charge> | null> => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証が必要です'
        );
      }

      const customer: string = (
        await db.doc(`customers/${context.auth.uid}`).get()
      ).data()?.customerId;

      if (customer) {
        const params: Stripe.ChargeListParams = {
          customer,
          limit: 10,
          expand: ['data.invoice'],
        };

        if (data?.startingAfter) {
          params.starting_after = data.startingAfter;
        }

        if (data?.endingBefore) {
          params.ending_before = data.endingBefore;
        }

        return stripe.charges.list(params);
      } else {
        return null;
      }
    }
  );
