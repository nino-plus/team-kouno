export interface Chat {
  uid: string;
  chat: string;
  chatId: string;
  eventId: string;
  createdAt: firebase.default.firestore.Timestamp;
}
