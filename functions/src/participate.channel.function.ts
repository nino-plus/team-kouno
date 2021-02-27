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

    const channelId = data.channelName;
    if (!channelId || typeof channelId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`channelId` is required'
      );
    }

    const isOwner = currentUserId === channelId;
    if (!isOwner && !isOpenChannel(channelId)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'channel is not open'
      );
    }

    await addUserToParticipantList(channelId, currentUserId);

    const token = generateToken(channelId, currentUserId);

    return { channelId, token, userId: currentUserId };
  });

async function isOpenChannel(channelId: string): Promise<boolean> {
  const ss = await db.collection('channels').doc(channelId).get();
  const channelState = ss.data()?.state ?? '';
  return channelState !== 'open' && channelState !== 'live';
}

async function addUserToParticipantList(
  channelId: string,
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

  await db.doc(`channels/${channelId}`).set({ channelId });

  await db
    .doc(`channels/${channelId}/participants/${currentUserId}`)
    .set(userData);
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

    const channelId = data.channelName;
    if (!channelId || typeof channelId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '`channelId` is required'
      );
    }
    functions.logger.info(channelId, '33');

    const token = generateToken(channelId, currentUserId);
    functions.logger.info(token, '36');

    return { channelId, token, currentUserId };
  });

function generateToken(channelName: string, userId: string): any {
  if (!appID) {
    throw new Error('Agora app ID is required');
  }

  if (!appSecret) {
    throw new Error('Agora app secret is required');
  }

  if (!channelName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Channel name is required'
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
    channelName,
    userId,
    role,
    privilegeExpiredTs
  );
  return token;
}
