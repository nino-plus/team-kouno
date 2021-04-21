import { User } from './user';

export interface Log {
  uid: string;
  logId: string;
  createdAt: firebase.default.firestore.Timestamp;
  eventId?: string;
  type: string;
}

export interface LogWithUser extends Log {
  user: User;
}
