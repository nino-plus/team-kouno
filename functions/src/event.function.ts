import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { deleteCollectionByReference } from './utils/firebase.util';

const db = admin.firestore();
const storage = admin.storage().bucket();
const batch = admin.firestore().batch();

export const addLogIntoFollowersFeeds = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}/logs/{logId}')
  .onCreate(async (snap, context) => {
    const followerIds: string[] = [];
    await db
      .collection(`users/${context.params.uid}/followers`)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          followerIds.push(doc.data().followerId);
        });
      });
    followerIds.forEach(async (followId) => {
      const feedsRef = db.doc(`users/${followId}/feeds/${snap.data().logId}`);

      batch.set(feedsRef, { ...snap.data() });
    });
    await batch.commit();
  });

export const deleteEvent = functions
  .region('asia-northeast1')
  .https.onCall(async (eventId: any) => {
    const reserveUidsRef = db
      .collectionGroup(`reserveUids`)
      .where('eventId', '==', eventId);
    const videoPublishUsersRef = db
      .collectionGroup(`videoPublishUsers`)
      .where('eventId', '==', eventId);
    const eventsRef = db.collection(`events`).where('eventId', '==', eventId);

    const deleteEventImage = storage.deleteFiles({
      prefix: `events/${eventId}`,
    });

    return Promise.all([
      deleteCollectionByReference(reserveUidsRef),
      deleteCollectionByReference(videoPublishUsersRef),
      deleteCollectionByReference(eventsRef),
      deleteEventImage,
    ]);
  });
