import { Algolia } from './utils/algolia.util';
import * as functions from 'firebase-functions';

const algolia = new Algolia();

export const createAlgoliaEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}')
  .onCreate((snap) => {
    const data = snap.data();
    functions.logger.info(data);
    return algolia.saveRecord({
      indexName: 'events',
      largeConcentKey: 'description',
      data,
    });
  });

export const deleteAlgoliaEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}')
  .onDelete((snap) => {
    const data = snap.data();
    functions.logger.info(data);

    if (data) {
      return algolia.removeRecord('events', data.eventId);
    } else {
      return;
    }
  });

export const updateAlgoliaEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}')
  .onUpdate((change) => {
    const data = change.after.data();
    functions.logger.info(data);

    return algolia.saveRecord({
      indexName: 'events',
      largeConcentKey: 'description',
      isUpdate: true,
      data,
    });
  });

export const deleteAlgoliaUser = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}')
  .onDelete((snap) => {
    const data = snap.data();
    functions.logger.info(data);
    if (data) {
      return algolia.removeRecord('users', data.uid);
    } else {
      return;
    }
  });

export const updateAlgoliaUser = functions
  .region('asia-northeast1')
  .firestore.document('users/{uid}')
  .onUpdate((change) => {
    const data = change.after.data();
    const beforeData = change.before.data();
    functions.logger.info(data);

    if (
      !beforeData.lastChangedAt ||
      beforeData.lastChangedAt === data.lastChangedAt
    ) {
      return algolia.saveRecord({
        indexName: 'users',
        isUpdate: true,
        idKey: 'uid',
        data,
      });
    } else {
      return null;
    }
  });
