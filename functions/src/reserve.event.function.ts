import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { shouldEventRun, markEventTried } from './utils/firebase.util';

const db = admin.firestore();

export const countUpReservedUsers = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/reserveUids/{uid}')
  .onCreate(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`events/${context.params.teamId}`)
          .update('reserveUserCount', admin.firestore.FieldValue.increment(1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });

export const countDownReservedUsers = functions
  .region('asia-northeast1')
  .firestore.document('teams/{teamId}/joinedUids/{uid}')
  .onDelete(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`events/${context.params.teamId}`)
          .update('reserveUserCount', admin.firestore.FieldValue.increment(-1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });
