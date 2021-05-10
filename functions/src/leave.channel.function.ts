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

    const eventId = data.eventId;
    if (!eventId || typeof eventId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`roomId` is required'
      );
    }

    await db.doc(`users/${currentUserId}`).update({ joinChannelId: '' });

    await db.doc(`events/${eventId}/participants/${currentUserId}`).delete();
  });
