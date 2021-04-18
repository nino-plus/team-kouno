import * as functions from 'firebase-functions';
import { stripe } from './client';
import Stripe from 'stripe';

export const getStripeTransfers = functions
  .region('asia-northeast1')
  .https.onCall(
    async (
      data: {
        stripeAccount: string;
        startingAfter?: string;
        endingBefore?: string;
      },
      context
    ) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証が必要です'
        );
      }

      if (!data?.stripeAccount) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '販売アカウントがありません'
        );
      }

      const params: Stripe.TransferListParams = {
        limit: 10,
        destination: data.stripeAccount,
        expand: ['data.destination_payment'],
      };

      if (data?.startingAfter) {
        params.starting_after = data.startingAfter;
      }

      if (data?.endingBefore) {
        params.ending_before = data.endingBefore;
      }
      return stripe.transfers.list(params);
    }
  );
