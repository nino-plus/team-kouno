import * as functions from 'firebase-functions';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import * as admin from 'firebase-admin';
import { shouldEventRun, markEventTried } from './utils/firebase.util';

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
  await db.doc(`events/${eventId}`).set(
    {
      islive: true,
    },
    {
      merge: true,
    }
  );
}

export const countUpParticipants = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/participants/{uid}')
  .onCreate(async (snap, context) => {
    const functionEventId: string = context.eventId;
    const eventId: string = context.params.eventId;
    const participantCount: number = await db
      .doc(`events/${eventId}`)
      .get()
      .then((event) => {
        return event.data()?.participantCount;
      });
    functions.logger.info(eventId, 'eventId');
    functions.logger.info(context, 'event');
    functions.logger.info(functionEventId, 'functionEventId');

    return shouldEventRun(functionEventId).then(async (should: boolean) => {
      if (should) {
        functions.logger.info(should, 'should');
        await db
          .doc(`events/${eventId}`)
          .update('participantCount', admin.firestore.FieldValue.increment(1))
          .then(async () => {
            if (participantCount >= 0) {
              await db.doc(`events/${eventId}`).set(
                {
                  islive: true,
                },
                {
                  merge: true,
                }
              );
            }
          });
        return markEventTried(functionEventId);
      } else {
        return;
      }
    });
  });

export const countDownParticipants = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/participants/{uid}')
  .onDelete(async (snap, context) => {
    const functionEventId = context.eventId;
    const eventId = context.params.eventId;
    const participantCount: number = await db
      .doc(`events/${eventId}`)
      .get()
      .then((event) => {
        return event.data()?.participantCount;
      });

    functions.logger.info(eventId, 'eventId');
    functions.logger.info(context, 'event');
    functions.logger.info(functionEventId, 'functionEventId');

    return shouldEventRun(functionEventId).then(async (should: boolean) => {
      functions.logger.info(should, 'should');

      if (should) {
        await db
          .doc(`events/${eventId}`)
          .update('participantCount', admin.firestore.FieldValue.increment(-1))
          .then(async () => {
            if (participantCount <= 1) {
              await db.doc(`events/${eventId}`).update({
                islive: false,
              });
            }
          });
        return markEventTried(functionEventId);
      } else {
        return;
      }
    });
  });

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

    const eventId = data.eventId;
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

function generateToken(eventId: string, userId: string): any {
  if (!appID) {
    throw new Error('Agora app ID is required');
  }

  if (!appSecret) {
    throw new Error('Agora app secret is required');
  }

  if (!eventId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'event Id is required'
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
    eventId,
    userId,
    role,
    privilegeExpiredTs
  );
  return token;
}
