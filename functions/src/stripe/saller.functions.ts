import * as cryptoRandomString from 'crypto-random-string';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { stripe } from './client';

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

    // ポータルサイトのURLを取得
    return stripe.accounts.createLoginLink(account.connectedAccountId);
  });
