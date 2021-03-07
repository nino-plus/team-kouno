export interface User {
  uid: string;
  name: string;
  avatarURL: string;
  email?: string;
  createdAt: firebase.default.firestore.Timestamp;
  description?: string;
  isPrivate: boolean;
  followerCount?: number;
  followingCount?: number;
  myEventCount?: number;
}
