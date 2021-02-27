import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate((user: any) => {
    return db.doc(`users/${user.uid}`).set(
      {
        uid: user.uid,
        name: user.displayName,
        avatarURL: user.photoURL,
        createdAt: new Date(),
      },
      { merge: true }
    );
  });
