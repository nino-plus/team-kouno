import * as functions from 'firebase-functions';
import * as cryptoRandomString from 'crypto-random-string';
import * as admin from 'firebase-admin';
import { ConnectedAccount } from './../interfaces/connected-account';
import { stripe } from './client';
import Stripe from 'stripe';
const db = admin.firestore();

export const getStripeConnectedAccountState = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'permission-denied',
        '認証エラーが発生しました。'
      );
    }

    // ステートを作成
    const state = cryptoRandomString({ length: 10 });

    // ステートをデータベースに保存しておく
    await db.doc(`connectedAccounts/${context.auth.uid}`).set(
      {
        userId: context.auth.uid,
        state,
      },
      { merge: true }
    );

    // ステートを返却
    return state;
  });

export const createStripeConnectedAccount = functions
  .region('asia-northeast1')
  .https.onRequest(async (req: any, resp: any) => {
    // 認証コードを受け取る
    const code = req.query.code as string;

    // 渡していたステートを受け取る
    const state = req.query.state;

    // 受け取ったステートを保管していたステートと照合する
    const connectDoc = (
      await db.collection('connectedAccounts').where('state', '==', state).get()
    ).docs[0];

    // 一致しなければ不正なリダイレクトとして離脱する
    if (!connectDoc.exists) {
      return resp
        .status(403)
        .json({ error: 'Incorrect state parameter: ' + state });
    }

    try {
      // 販売アカウントを作成
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      });

      const connectedAccountId: any = response.stripe_user_id;

      // 売上の入金を手動に設定
      await stripe.accounts.update(connectedAccountId, {
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
      });

      // 販売アカウントのIDをFirestoreに保存
      await connectDoc.ref.set({
        connectedAccountId,
      });

      // 実際には環境変数を使うなどしてリダイレクト先のホストを本番環境に向ける
      resp.redirect(`https://eventstand-3c145.web.app/`);
      return;
    } catch (err) {
      if (err.type === 'StripeInvalidGrantError') {
        return resp
          .status(400)
          .json({ error: 'Invalid authorization code: ' + code });
      } else {
        return resp.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  });

export const getStripeAccountLoginLink = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'permission-denied',
        '認証エラーが発生しました。'
      );
    }
    // Firestoreなどから販売者アカウントIDを取得している
    const account: any = (
      await db.doc(`connectedAccounts/${context.auth.uid}`).get()
    ).data();

    if (!account) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        '販売アカウントがありません'
      );
    }

    // ポータルサイトのURLを取得
    return stripe.accounts.createLoginLink(account.connectedAccountId);
  });

export const getStripePricesFromConnectedAccount = functions
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

    if (!connectedAccount) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        '販売アカウントが存在しません'
      );
    }

    if (!connectedAccount.products || !connectedAccount.products.length) {
      return null;
    }

    return Promise.all(
      connectedAccount.products.map((product) => {
        return stripe.prices
          .list({
            active: true,
            product,
            expand: ['data.product'],
          })
          .then((res) => res.data && res.data[0]);
      })
    );
  });

export const getStripeAccountBalance = functions
  .region('asia-northeast1')
  .https.onCall(
    async (data, context): Promise<Stripe.Balance> => {
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
        throw new functions.https.HttpsError(
          'unauthenticated',
          '販売アカウントが存在しません'
        );
      }

      return stripe.balance.retrieve({
        stripeAccount: connectedAccount.connectedAccountId,
      });
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

    if (!connectedAccount) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        '販売アカウントが存在しません'
      );
    }
    // 現在の残高を取得
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccount.connectedAccountId,
    });
    // 残高のうち、振込可能な残高を取得
    const amount: number = balance.available[0].amount;
    // 振込手数料を計算（Stripe手数料と同額）
    const fee: number = Math.floor((Math.round(amount * 0.0025) + 450) * 1.1);

    console.log(amount);
    console.log(fee);
    console.log(amount - fee);
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

    // 残高をプラットフォームに転送
    return stripe.charges.create({
      amount: fee,
      currency: 'jpy',
      source: 'connectedAccount.connectedAccountId',
    });
  });
