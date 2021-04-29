import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Follower } from '../interfaces/follower';
import { Following } from '../interfaces/following';
import { UnfollowDialogComponent } from '../shared/unfollow-dialog/unfollow-dialog.component';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UserFollowService {
  constructor(private db: AngularFirestore, private dialog: MatDialog) {}

  follow(uid: string, targetId: string): void {
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
