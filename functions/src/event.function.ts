import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { deleteCollectionByReference } from './utils/firebase.util';

const db = admin.firestore();
const storage = admin.storage().bucket();

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
