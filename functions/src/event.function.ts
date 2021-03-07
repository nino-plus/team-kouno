import { Algolia } from './utils/algolia.util';
import * as functions from 'firebase-functions';

const algolia = new Algolia();

export const createEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}')
  .onCreate((snap) => {
    const data = snap.data();
    functions.logger.info(data);
    return algolia.saveRecord({
      indexName: 'events',
      largeConcentKey: 'description',
      data: {
        eventId: data.eventId,
        name: data.name,
        category: data.category,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        thumbnailURL: data.thumbnailURL,
        description: data.description,
        startAt: data.startAt,
        exitAt: data.exitAt,
        ownerId: data.ownerId,
        participantCount: data.participantCount,
        reserveUserCount: data.reserveUserCount,
      },
    });
  });

export const deleteEvent = functions
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

export const updateEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}')
  .onUpdate((change) => {
    const data = change.after.data();
    functions.logger.info(data);

    return algolia.saveRecord({
      indexName: 'events',
      largeConcentKey: 'description',
      isUpdate: true,
      data: {
        eventId: data.eventId,
        name: data.name,
        category: data.category,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        thumbnailURL: data.thumbnailURL,
        description: data.description,
        startAt: data.startAt,
        exitAt: data.exitAt,
        ownerId: data.ownerId,
        participantCount: data.participantCount,
        reserveUserCount: data.reserveUserCount,
      },
    });
  });
