import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const sendPushMessage = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    const tokens: string[] = data;
    const message = {
      data: {
        score: '1on1リクエストが届いています',
        time: admin.firestore.Timestamp.now().toDate().toString(),
      },
      tokens: tokens,
    };

    await admin
      .messaging()
      .sendMulticast(message)
      .then((res) => {
        functions.logger.info('seccess', res);
      })
      .catch((error) => {
        functions.logger.info('send error', error);
      });
  });
