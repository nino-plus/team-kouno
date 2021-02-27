import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { Chat } from '../interfaces/chat';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private db: AngularFirestore, private snackBar: MatSnackBar) {}

  async createChat(eventId: string, uid: string, chat): Promise<void> {
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
