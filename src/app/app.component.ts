import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './interfaces/user';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user$: Observable<User> = this.authService.user$;
  user: User;
  connected = navigator.onLine;
  usersRef = this.db.collection('users');

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private rdb: AngularFireDatabase
  ) {
    this.user$.subscribe((user) => {
      const onlineRef = this.rdb.database.ref(`/status/${user.uid}`);
      onlineRef.on('value', () => {
        this.usersRef.doc(user.uid).set(
          {
            online: true,
          },
          { merge: true }
        );

        this.rdb.database.ref(`/status/${user.uid}`).set('online');
      });
      rdb.database
        .ref(`/status/${user.uid}`)
        .onDisconnect()
        .set('offline')
        .then(() => {
          this.usersRef.doc(user.uid).set(
            {
              online: false,
            },
            { merge: true }
          );
          rdb.database.ref(`/status/${user.uid}`).set('online');
        });
    });
  }
}
