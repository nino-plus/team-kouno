import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { stripe } from '../stripe/client';
import { Customer } from '../interfaces/customer';
const db = admin.firestore();

export const payStripeProduct = functions
  .region('asia-northeast1')
  .https.onCall(
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

      const product: any = await stripe.prices
        .retrieve(data.priceId)
        .then((price) => price.product);

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
        functions.logger.info(data.connectedAccountId);
        // CtoCの場合、販売者アカウントとプラットフォームの手数料を設定に追加
        if (data.connectedAccountId) {
          functions.logger.info('true');
          params.application_fee_amount = 10; // プラットフォーム手数料（%）
          params.transfer_data = { destination: data.connectedAccountId[0] };
          functions.logger.info(params.transfer_data);
        }

        // 設定を使って請求書を作成
        const invoice = await stripe.invoices.create(params);

        // 請求書に対する支払いを行う
        return stripe.invoices.pay(invoice.id).then(async () => {
          await stripe.products.update(product, { active: false });
        });
      } catch (error) {
        throw new functions.https.HttpsError('unauthenticated', error.code);
      }
    }
  );
