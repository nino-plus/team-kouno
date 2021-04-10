import { stripe } from './client';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { Customer } from '../interfaces/customer';

const db = admin.firestore();

export const createStripeSetupIntent = functions
  .region('asia-northeast1')
  .https.onCall(
    async (_, context): Promise<Stripe.SetupIntent> => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証エラーが発生しました。'
        );
      }
      const customer: Customer = (
        await db.doc(`customers/${context.auth.uid}`).get()
      ).data() as Customer;
      if (!customer) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'プラットフォームにカスタマーが存在しません。'
        );
      }
      return stripe.setupIntents.create({
        payment_method_types: ['card'],
        customer: customer.customerId,
      });
    }
  );

export const setStripePaymentMethod = functions
  .region('asia-northeast1')
  .https.onCall(
    async (data: { paymentMethod: string }, context): Promise<void> => {
      if (!data) {
        throw new functions.https.HttpsError(
          'data-loss',
          'データが存在しません。'
        );
      }
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証エラーが発生しました。'
        );
      }

      const customerDoc = db.doc(`customers/${context.auth.uid}`);
      const customer: Customer = (await customerDoc.get()).data() as Customer;

      if (!customer) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'プラットフォームにカスタマーが存在しません。'
        );
      }
      if (!customer.paymentMethods?.length) {
        await stripe.customers.update(customer.customerId, {
          invoice_settings: {
            default_payment_method: data.paymentMethod,
          },
        });
      }
      await customerDoc.update({
        paymentMethods: admin.firestore.FieldValue.arrayUnion(
          data.paymentMethod
        ),
        defaultPaymentMethod:
          customer.paymentMethods?.length > 0
            ? customer.defaultPaymentMethod
            : data.paymentMethod,
      });
    }
  );

export const getStripePaymentMethod = functions
  .region('asia-northeast1')
  .https.onCall(
    async (data, context): Promise<Stripe.ApiList<Stripe.PaymentMethod>> => {
      if (!context.auth) {
        throw new functions.https.HttpsError('permission-denied', 'not user');
      }

      const customerDoc = await db.doc(`customers/${context.auth.uid}`).get();
      const customer: Customer = customerDoc.data() as Customer;

      if (!customer) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'there is no customer'
        );
      }

      return stripe.paymentMethods.list({
        customer: customer.customerId,
        type: 'card',
      });
    }
  );

export const deleteStripePaymentMethod = functions
  .region('asia-northeast1')
  .https.onCall(
    async (data: { id: string }, context): Promise<Stripe.PaymentMethod> => {
      if (!data) {
        throw new functions.https.HttpsError(
          'data-loss',
          'データが存在しません'
        );
      }

      if (!context.auth) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証エラーが発生しました。'
        );
      }

      const customerDoc = db.doc(`customers/${context.auth.uid}`);
      const customer = (await customerDoc.get()).data() as Customer;

      if (!customer) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'プラットフォームにカスタマーが存在しません。'
        );
      }

      await customerDoc.update({
        paymentMethods: admin.firestore.FieldValue.arrayRemove(data.id),
        defaultPaymentMethod:
          customer.paymentMethods?.length > 1
            ? customer.defaultPaymentMethod
            : null,
      });

      return stripe.paymentMethods.detach(data.id);
    }
  );
