import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase/app';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Chat, ChatWithUser } from '../interfaces/chat';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  async createChat(eventId: string, uid: string, chat): Promise<void> {
    const chatId = this.db.createId();
    this.db.doc<Chat>(`events/${eventId}/chats/${chatId}`).set({
      ...chat,
      uid,
      chatId,
      eventId,
      createdAt: firebase.firestore.Timestamp.now(),
    });
  }

  getChatsWithUser(eventId: string): Observable<ChatWithUser[]> {
    return this.db
      .collection<Chat>(`events/${eventId}/chats`, (ref) =>
        ref.orderBy('createdAt', 'asc')
      )
      .valueChanges()
      .pipe(
        switchMap((chats: Chat[]) => {
          if (chats.length) {
            const unduplicatedUids: string[] = Array.from(
              new Set(chats.map((chat) => chat.uid))
            );

            const users$: Observable<User[]> = combineLatest(
              unduplicatedUids.map((uid) => this.userService.getUserData(uid))
            );
            return combineLatest([of(chats), users$]);
          } else {
            return of([]);
          }
        }),
        map(([chats, users]) => {
          if (chats?.length) {
            return chats.map((chat: Chat) => {
              return {
                ...chat,
                user: users.find((user: User) => chat.uid === user?.uid),
              };
            });
          } else {
            return [];
          }
        })
      );
  }

  deleteChat(eventId: string, chatId: string): Promise<void> {
    return this.db
      .doc<Chat>(`events/${eventId}/chats/${chatId}`)
      .delete()
      .then(() => {
        this.snackBar.open('削除しました');
      });
  }
}
