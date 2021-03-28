import { User } from '../interfaces/user';

export interface Invite {
  roomId: string;
  senderUid: string;
}

export interface InviteWithSender extends Invite {
  sender: User;
}
