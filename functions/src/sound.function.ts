import * as functions from 'firebase-functions';
import { Howl } from 'howler';

const postSound: Howl = new Howl({
  src: ['assets/sounds/pa.mp3'],
});

export const createChat = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/chats/{chatId}')
  .onCreate((snap) => {
    functions.logger.info(snap);
    postSound.play();
  });
