import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Follower } from '../interfaces/follower';
import { Following } from '../interfaces/following';
import { Log } from '../interfaces/log';
import { UnfollowDialogComponent } from '../shared/unfollow-dialog/unfollow-dialog.component';
@Injectable({
  providedIn: 'root',
})
export class UserFollowService {
  logs: firebase.firestore.DocumentData[];
  constructor(private db: AngularFirestore, private dialog: MatDialog) {}

  async follow(uid: string, targetId: string): Promise<void> {
    this.db
      .collection<Log>(`users/${targetId}/logs`)
      .valueChanges()
      .pipe(take(1))
      .subscribe((vals) => {
        vals.forEach((log) => {
          this.db.collection(`users/${uid}/feeds`).add(log);
        });
      });

    this.db.doc<Following>(`users/${uid}/follows/${targetId}`).set({
      uid,
      followingId: targetId,
      createdAt: firebase.firestore.Timestamp.now(),
    });
    this.db.doc<Follower>(`users/${targetId}/followers/${uid}`).set({
      uid: targetId,
      followerId: uid,
      createdAt: firebase.firestore.Timestamp.now(),
    });
  }

  unFollow(uid: string, targetId: string): void {
    this.dialog
      .open(UnfollowDialogComponent, {
        width: '250px',
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.db.doc<Following>(`users/${uid}/follows/${targetId}`).delete();
          this.db.doc<Following>(`users/${targetId}/followers/${uid}`).delete();
        }
      });
  }

  checkFollowing(uid: string, targetId: string): Observable<boolean> {
    return this.db
      .doc(`users/${uid}/follows/${targetId}`)
      .valueChanges()
      .pipe(map((doc) => !!doc));
  }
}
