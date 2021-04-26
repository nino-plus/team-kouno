import * as functions from 'firebase-functions';
import { stripe } from './client';
import Stripe from 'stripe';
import { ConnectedAccount } from '../interfaces/connected-account';
import * as admin from 'firebase-admin';
const db = admin.firestore();

export const getStripeTransfers = functions
  .region('asia-northeast1')
  .https.onCall(
    async (
      data: {
        stripeAccount?: string;
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

      const connectedAccount: ConnectedAccount = (
        await db.doc(`connectedAccounts/${context.auth.uid}`).get()
      )?.data() as ConnectedAccount;

      if (!connectedAccount) {
        return null
      }

      const params: Stripe.TransferListParams = {
        limit: 10,
        destination: connectedAccount.connectedAccountId,
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
