import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const sendPushMessage = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    const tokens: string[] = data.tokens;
    const message = {
      data: {
        title: '1on1リクエスト',
        body: `${data.name}からリクエストが届いています`,
        icon: data.icon,
        roomId: data.roomId,
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
