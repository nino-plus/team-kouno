import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { MessagingService } from './services/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user$: Observable<any> = this.authService.afUser$;
  uid: string;
  connected = navigator.onLine;
  firestoreUsersRef = this.db.collection('users');
  databaseUserStatusRef = this.rdb.database.ref('/status/');

  isOfflineForFirestore = {
    state: 'offline',
    lastChangedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  isOnlineForFirestore = {
    state: 'online',
    lastChangedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  isOfflineForDatabase = {
    state: 'offline',
    lastChangedAt: firebase.database.ServerValue.TIMESTAMP,
  };

  isOnlineForDatabase = {
    state: 'online',
    lastChangedAt: firebase.database.ServerValue.TIMESTAMP,
  };

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private rdb: AngularFireDatabase,
    public messagingService: MessagingService,
    private router: Router
  ) {
    this.user$.subscribe((user) => {
      if (!user) {
        return;
      }
      const onlineRef = this.rdb.database.ref(`.info/connected`);
      onlineRef.on('value', (snapshot) => {
        if (snapshot.val() == false) {
          this.firestoreUsersRef
            .doc(user.uid)
            .set(this.isOfflineForFirestore, { merge: true });
          return;
        }
      });
      this.rdb.database
        .ref(`/status/${user.uid}`)
        .onDisconnect()
        .set(this.isOfflineForDatabase)
        .then(() => {
          this.rdb.database
            .ref(`/status/${user.uid}`)
            .set(this.isOnlineForDatabase);

          this.firestoreUsersRef
            .doc(user.uid)
            .set(this.isOnlineForFirestore, { merge: true });
        });
    });
  }

  close(): void {
    this.messagingService.isShow = false;
  }

  navigateMeeting(roomId: string): void {
    this.router.navigateByUrl('meeting/' + roomId);
    this.close();
  }
}
