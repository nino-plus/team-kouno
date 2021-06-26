import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onUserStatusChanged = functions.database
  .ref('/status/{uid}')
  .onUpdate(async (change, context) => {
    functions.logger.info(change, '10');
    const eventStatus = change.after.val();
    const userStatusFirestoreRef = db.doc(`users/${context.params.uid}`);

    const statusSnapshot = await change.after.ref.once('value');
    const status = statusSnapshot.val();
    functions.logger.log(status, eventStatus);

    if (status.lastChangedAt > eventStatus.lastChangedAt) {
      return null;
    }

    eventStatus.lastChangedAt = new Date(eventStatus.lastChangedAt);

    if (userStatusFirestoreRef) {
      return userStatusFirestoreRef.set(
        {
          state: eventStatus.state,
          lastChangedAt: eventStatus.lastChangedAt,
          uid: context.params.uid,
        },
        { merge: true }
      );
    } else {
      return null;
    }
  });
