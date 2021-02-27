import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
import { Chat } from '../interfaces/chat';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private db: AngularFirestore, private snackBar: MatSnackBar) {}

  async createChat(eventId: string, uid: string, chat: Chat): Promise<void> {
    const chatId = this.db.createId();
    this.db.doc<Chat>(`events/${eventId}/chats/${chatId}`).set({
      ...chat,
      uid,
      chatId,
      eventId,
      createdAt: firebase.default.firestore.Timestamp.now(),
    });
  }
}
