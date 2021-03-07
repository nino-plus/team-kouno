export interface Follower {
  uid: string;
  followerId: string;
  createdAt: firebase.default.firestore.Timestamp;
}
