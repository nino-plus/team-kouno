import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { stripe } from '../stripe/client';
import { Customer } from '../interfaces/customer';
import { ConnectedAccount } from '../interfaces/connected-account';
const db = admin.firestore();

export const charge = functions.region('asia-northeast1').https.onCall(
  async (
    data: {
      priceId: string;
      connectedAccountId?: string;
    },
    context
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'permission-denied',
        '認証エラーが発生しました。'
      );
    }
    // Firestoreの顧客データを取得
    const customer: Customer = (
      await db.doc(`customers/${context.auth.uid}`).get()
    ).data() as Customer;

    try {
      // 請求書に追加する項目（価格、税金）を登録
      await stripe.invoiceItems.create({
        customer: customer.customerId,
        price: data.priceId,
        tax_rates: [functions.config().stripe.tax],
      });

      // 請求書を作成するための設定
      const params: Stripe.InvoiceCreateParams = {
        customer: customer.customerId,
      };

      // CtoCの場合、販売者アカウントとプラットフォームの手数料を設定に追加
      if (data.connectedAccountId) {
        params.application_fee_amount = 10; // プラットフォーム手数料（%）
        params.transfer_data = { destination: data.connectedAccountId };
      }

      // 設定を使って請求書を作成
      const invoice = await stripe.invoices.create(params);

      // 請求書に対する支払いを行う
      return stripe.invoices.pay(invoice.id);
    } catch (error) {
      throw new functions.https.HttpsError('unauthenticated', error.code);
    }
  }
);

export const payoutToStripeAccount = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'permission-denied',
        '認証が必要です'
      );
    }

    const connectedAccount: ConnectedAccount = (
      await db.doc(`connectedAccounts/${context.auth.uid}`).get()
    )?.data() as ConnectedAccount;
    // 現在の残高を取得
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccount.connectedAccountId,
    });

    // 残高のうち、振込可能な残高を取得
    const amount: number = balance.available[0].amount;

    // 振込手数料を計算（Stripe手数料と同額）
    const fee: number = Math.floor((Math.round(amount * 0.0025) + 450) * 1.1);

    // 振込手数料を引いた金額を振込
    await stripe.payouts.create(
      {
        amount: balance.available[0].amount - fee,
        currency: 'jpy',
      },
      {
        stripeAccount: connectedAccount.connectedAccountId,
      }
    );

    // 振込手数料をプラットフォームに転送
    return stripe.charges.create({
      amount: fee,
      currency: 'jpy',
      source: 'connectedAccount.connectedAccountId',
    });
  });
