import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { shareReplay, skip, take } from 'rxjs/operators';
import { InviteWithSender } from './intefaces/invite';
import { User } from './interfaces/user';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';
import { AuthService } from './services/auth.service';
import { MeetingService } from './services/meeting.service';
import { MessagingService } from './services/messaging.service';
import { SoundService } from './services/sound.service';

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

  invites$: Observable<InviteWithSender[]>;
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private rdb: AngularFireDatabase,
    public messagingService: MessagingService,
    private router: Router,
    private meetingService: MeetingService,
    private soundService: SoundService,
    private dialog: MatDialog
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

    // this.user$
    //   .pipe(take(1))
    //   .toPromise()
    //   .then((user: User) => {
    //     console.log(user);

    //     this.meetingService
    //       .getInvites(user.uid)
    //       .pipe(skip(1), shareReplay(1))
    //       .subscribe((invites) => {
    //         const lastInvite = invites.shift();

    //         if (lastInvite.createdAt.toMillis() >= this.dateNow.toMillis()) {
    //           this.soundService.callSound.play();
    //           console.log(lastInvite);

    //           this.dialog.open(InviteDialogComponent, {
    //             data: { lastInvite, user },
    //           });
    //         }
    //       });
    //   });
  }

  close(): void {
    this.messagingService.isShow = false;
  }

  navigateMeeting(roomId: string): void {
    this.router.navigateByUrl('meeting/' + roomId);
    this.close();
  }
}
