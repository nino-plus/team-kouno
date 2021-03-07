import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { shouldEventRun, markEventTried } from './utils/firebase.util';

const db = admin.firestore();

export const countUpfollowings = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}/follows/{followingId}')
  .onCreate(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`users/${context.params.uid}`)
          .update('followingCount', admin.firestore.FieldValue.increment(1));
      } else {
        return;
      }
    });
  });

export const countUpfollowers = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}/followers/{followerId}')
  .onCreate(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`users/${context.params.uid}`)
          .update('followerCount', admin.firestore.FieldValue.increment(1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });

export const countDownfollowings = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}/follows/{followingId}')
  .onDelete(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`users/${context.params.uid}`)
          .update('followingCount', admin.firestore.FieldValue.increment(-1));
      } else {
        return;
      }
    });
  });

export const countDownfollowers = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}/followers/{followerId}')
  .onDelete(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`users/${context.params.uid}`)
          .update('followerCount', admin.firestore.FieldValue.increment(-1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });
