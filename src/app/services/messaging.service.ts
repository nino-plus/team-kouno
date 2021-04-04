import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Token } from '../interfaces/token';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private messaging = firebase.default.messaging();

  currentMessage = new BehaviorSubject(null);
  isShow = true;

  constructor(
    private msg: AngularFireMessaging,
    private db: AngularFirestore,
    private snackBar: MatSnackBar
  ) {
    // this.messaging.getToken({
    //   vapidKey:
    //     'BC3WiS6p2C8B303gUBsDGwouELI-juo03jFagpLlYbFzaYKoPhYeJfLZipRIRFHYaQwi8edRHNKrQ3bqVQzUBsY',
    // });
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
}
