import * as functions from 'firebase-functions';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import * as admin from 'firebase-admin';

const db = admin.firestore();

const appID = functions.config().agora.app_id;
const appSecret = functions.config().agora.app_secret;
const lifeTimeSec = 60 * 60;

export const participateChannel = functions
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

    await addUserToParticipantList(eventId, currentUserId);

    const token = generateToken(eventId, currentUserId);

    return { eventId, token, userId: currentUserId };
  });

async function isOpenChannel(eventId: string): Promise<boolean> {
  const ss = await db.collection('events').doc(eventId).get();
  const eventState = ss.data()?.state ?? '';
  return eventState !== 'open' && eventState !== 'live';
}

async function addUserToParticipantList(
  eventId: string,
  currentUserId: string
) {
  const ssUser = await db.collection('users').doc(currentUserId).get();
  const userData = ssUser.data();
  if (!userData) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User data must exist'
    );
  }

  await db.doc(`events/${eventId}/participants/${currentUserId}`).set(userData);
}

export const getChannelToken = functions
  .region('asia-northeast1')
  .https.onCall((data, context) => {
    const currentUserId = context.auth?.uid;
    if (!currentUserId) {
      functions.logger.info('currentUserId is null', '18');
      throw new functions.https.HttpsError(
        'permission-denied',
        'Can not logged In'
      );
    }
    functions.logger.info(data, '24');

    const eventId = data.eventName;
    if (!eventId || typeof eventId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`eventId` is required'
      );
    }
    functions.logger.info(eventId, '33');

    const token = generateToken(eventId, currentUserId);
    functions.logger.info(token, '36');

    return { eventId, token, currentUserId };
  });

function generateToken(eventName: string, userId: string): any {
  if (!appID) {
    throw new Error('Agora app ID is required');
  }

  if (!appSecret) {
    throw new Error('Agora app secret is required');
  }

  if (!eventName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'event name is required'
    );
  }

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required'
    );
  }

  const role = RtcRole.PUBLISHER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + lifeTimeSec;

  const token = RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appSecret,
    eventName,
    userId,
    role,
    privilegeExpiredTs
  );
  return token;
}
