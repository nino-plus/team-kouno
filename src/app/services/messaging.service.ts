import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { mergeMapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private msg: AngularFireMessaging, private db: AngularFirestore) {
    this.msg.messages.subscribe((messaging: AngularFireMessaging) => {
      messaging.onMessage = messaging.onMessage.bind(messaging);
      messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
    });
  }
  requestPermission(uid: string) {
    this.msg.requestPermission
      .pipe(mergeMapTo(this.msg.tokenChanges))
      .subscribe(
        (token) => this.db.doc(`users/${uid}/tokens/${token}`).set({ token }),
        (error) => console.error(error)
      );
  }

  receiveMessage() {
    this.msg.messages.subscribe((payload) => {
      console.log('new message received. ', payload);
      this.currentMessage.next(payload);
    });
  }

  sendMessage() {}
}
