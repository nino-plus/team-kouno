import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const publishVideo = functions
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
        '`eventId` is required'
      );
    }

    const isOwner = currentUserId === eventId;
    if (!isOwner && !isOpenChannel(eventId)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'event is not open'
      );
    }

    const ssUser = await db.collection('users').doc(currentUserId).get();
    const userData = ssUser.data();
    if (!userData) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User data must exist'
      );
    }

    await db
      .doc(`events/${eventId}/videoPublishUsers/${currentUserId}`)
      .set(userData);

    return { eventId, userId: currentUserId };
  });

async function isOpenChannel(eventId: string): Promise<boolean> {
  const ss = await db.collection('events').doc(eventId).get();
  const eventState = ss.data()?.state ?? '';
  return eventState !== 'open' && eventState !== 'live';
}
