import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { deleteCollectionByReference } from './utils/firebase.util';
import { Algolia } from './utils/algolia.util';

const algolia = new Algolia();

const db = admin.firestore();

export const createUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(async (user: any) => {
    const userData = {
      uid: user.uid,
      name: user.displayName,
      avatarURL: user.photoURL,
      email: user.email,
      createdAt: new Date(),
      followerCount: 0,
      followingCount: 0,
      myEventCount: 0,
      isPrivate: false,
    };
    return db
      .doc(`users/${user.uid}`)
      .set(userData, { merge: true })
      .then(() => {
        functions.logger.info(userData, 'algoliaユーザー');
        return algolia.saveRecord({
          indexName: 'users',
          data: userData,
          idKey: 'uid',
        });
      });
  });

export const deleteAfUser = functions
  .region('asia-northeast1')
  .https.onCall((data, _) => {
    return admin.auth().deleteUser(data);
  });

export const deleteUserAccount = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(async (user, _) => {
    const uid = user.uid;
    const deleteDbUser = db.doc(`users/${uid}`).delete();
    const events = db.collection(`events`).where('ownerId', '==', uid);
    const deleteAllEvents = deleteCollectionByReference(events);
    const reservedEvents = db
      .collectionGroup(`reserveUids`)
      .where('uid', '==', uid);
    const deleteAllReservedEvents = deleteCollectionByReference(reservedEvents);
    const deleteFollows = db
      .collectionGroup(`follows`)
      .where('followingId', '==', uid);
    const deleteFollowers = db
      .collectionGroup(`followers`)
      .where('followerId', '==', uid);
    const deleteMyFollows = db.collection(`users/${uid}/follows`);
    const deleteMyFollowers = db.collection(`users/${uid}/followers`);
    return Promise.all([
      deleteDbUser,
      deleteAllEvents,
      deleteAllReservedEvents,
      deleteFollows,
      deleteFollowers,
      deleteMyFollows,
      deleteMyFollowers,
    ]);
  });
