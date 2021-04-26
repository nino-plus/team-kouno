import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { MatSnackBar } from '@angular/material/snack-bar';
import admin from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Token } from '../interfaces/token';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private messaging;
  currentMessage = new BehaviorSubject(null);
  isShow = true;

  constructor(
    private msg: AngularFireMessaging,
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private fns: AngularFireFunctions
  ) {
    try {
      this.messaging = admin.messaging();
    } catch (e) {
      console.log('Unable to Instantiate Firebase Messaing', e);
    }
  }

  requestPermission(uid: string) {
    if (!uid) {
      this.snackBar.open(
        'トークンの取得に失敗しました。ログインしていますか？'
      );
    }
    this.msg.requestToken.subscribe(
      (token) =>
        this.db
          .doc(`users/${uid}/tokens/${token}`)
          .set({ token })
          .then(() => this.snackBar.open('通知を許可に設定しました')),
      (error) =>
        this.snackBar.open(
          'トークンの取得に失敗しました' + ' ' + 'エラー:' + error
        )
    );
  }

  deleteToken(uid: string) {
    this.msg.getToken
      .pipe(mergeMap((token) => this.msg.deleteToken(token)))
      .subscribe((token) => {
        this.db
          .doc(`users/${uid}/tokens/${token}`)
          .delete()
          .finally(() => this.snackBar.open('通知を拒否に設定しました'));
      });
  }

  getTokens(uid: string): Observable<Token[]> {
    return this.db.collection<Token>(`users/${uid}/tokens`).valueChanges();
  }

  receiveMessage() {
    console.log('receive');

    this.messaging.onMessage((payload) => {
      console.log(payload);
      this.currentMessage.next(payload);
      this.isShow = true;
    });
  }

  async sendPushMessage(
    tokens: string[],
    authUser: User,
    roomId: string
  ): Promise<void> {
    const callable = this.fns.httpsCallable('sendPushMessage');
    return callable({
      tokens,
      icon: authUser.avatarURL,
      name: authUser.name,
      roomId,
    })
      .toPromise()
      .then(() => {
        this.receiveMessage();
      });
  }
}
