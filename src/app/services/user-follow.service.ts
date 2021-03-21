import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Follower } from '../interfaces/follower';
import { Following } from '../interfaces/following';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UserFollowService {
  constructor(private db: AngularFirestore) {}

  follow(uid: string, targetId: string): void {
    this.db.doc<Following>(`users/${uid}/follows/${targetId}`).set({
      uid,
      followingId: targetId,
      createdAt: firebase.default.firestore.Timestamp.now(),
    });
    this.db.doc<Follower>(`users/${targetId}/followers/${uid}`).set({
      uid: targetId,
      followerId: uid,
      createdAt: firebase.default.firestore.Timestamp.now(),
    });
  }

  unFollow(uid: string, targetId: string): void {
    this.db.doc<Following>(`users/${uid}/follows/${targetId}`).delete();
    this.db.doc<Following>(`users/${targetId}/followers/${uid}`).delete();
  }

  async checkFollowing(uid: string, targetId: string): Promise<boolean> {
    return this.db
      .doc(`users/${uid}/follows/${targetId}`)
      .valueChanges()
      .pipe(take(1))
      .toPromise()
      .then((doc) => !!doc);
  }
}
