import { User } from './user';

export interface Event {
  eventId: string;
  name: string;
  createdAt: firebase.default.firestore.Timestamp;
  updatedAt: firebase.default.firestore.Timestamp;
  startAt: firebase.default.firestore.Timestamp;
  exitAt: firebase.default.firestore.Timestamp;
  ownerId: string;
  thumbnailURL: string;
  description: string;
  category: string;
  participantCount?: number;
  participants?: User[];
  reserveUserCount?: number;
  isShareScreen?: boolean;
  screenOwnerUid?: string;
  videoPublishUsers?: User[];
  isSpecial?: boolean;
  price?: number;
  headcountLimit?: number;
}

export interface EventWithOwner extends Event {
  user: User;
}
