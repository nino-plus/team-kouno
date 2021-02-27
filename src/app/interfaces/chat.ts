import { User } from './user';

export interface Chat {
  uid: string;
  chatBody: string;
  chatId: string;
  eventId: string;
  createdAt: firebase.default.firestore.Timestamp;
}

export interface ChatWithUser extends Chat {
  user: User;
}
