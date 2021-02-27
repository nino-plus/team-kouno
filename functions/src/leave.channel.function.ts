import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const leaveFromSession = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context) => {
    const currentUserId = context.auth?.uid;
    if (!currentUserId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not logged in'
      );
    }

    const channelId = data.channelName;
    if (!channelId || typeof channelId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`roomId` is required'
      );
    }

    await db
      .doc(`channels/${channelId}/participants/${currentUserId}`)
      .delete();
  });
