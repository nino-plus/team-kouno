import { stripe } from './client';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const db = admin.firestore();
export const createStripeProductAndPrice = functions
  .region('asia-northeast1')
  .https.onCall(
    async (
      data: {
        name: string;
        amount: number;
      },
      context
    ) => {
      if (!data) {
        throw new functions.https.HttpsError(
          'data-loss',
          '必要なデータがありません'
        );
      }
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          '認証が必要です'
        );
      }
      // 受け取ったデータ（名前）を使ってプロダクトを作成
      const product = await stripe.products.create({
        name: data.name,
      });

      // 価格追加用の設定
      const params: Stripe.PriceCreateParams = {
        unit_amount: data.amount,
        product: product.id,
        nickname: data.name,
        currency: 'jpy',
      };

      // 価格を作成
      await stripe.prices.create(params);

      // 商品データベースに追加
      return db.doc(`products/${product.id}`).set({
        id: product.id,
        name: data.name,
        userId: context.auth.uid,
      });
    }
  );
