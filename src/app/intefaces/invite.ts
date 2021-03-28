import { User } from '../interfaces/user';

export interface Invite {
  roomId: string;
  senderUid: string;
  createdAt: firebase.default.firestore.Timestamp;
}

export interface InviteWithSender extends Invite {
  sender: User;
}
