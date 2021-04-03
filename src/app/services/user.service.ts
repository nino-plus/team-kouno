import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Follower } from '../interfaces/follower';
import { Following } from '../interfaces/following';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isProcessing: boolean;

  constructor(
    private db: AngularFirestore,
    private fnc: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  getUserData(uid: string): Observable<User> {
    return this.db.doc<User>(`users/${uid}`).valueChanges();
  }

  getUsers(): Observable<User[]> {
    return this.db.collection<User>(`users`).valueChanges();
  }

  async updateUser(user: Omit<User, 'createdAt'>): Promise<void> {
    await this.db.doc<User>(`users/${user.uid}`).update({
      ...user,
    });
  }

  async updateIsPrivate(uid: string, value: boolean): Promise<void> {
    await this.db
      .doc<User>(`users/${uid}`)
      .update({
        isPrivate: value,
      })
      .then(() => this.snackBar.open('プライバシー設定を保存しました'));
  }

  async deleteUser(user: User): Promise<void> {
    this.isProcessing = true;
    const callable = this.fnc.httpsCallable('deleteAfUser');
    return callable(user.uid)
      .toPromise()
      .then(() => {
        this.snackBar.open('ご利用ありがとうございました');
        this.router.navigateByUrl('/');
      })
      .finally(() => {
        this.isProcessing = false;
      });
  }

  getFollowers(uid: string) {
    return this.db
      .collection<Follower>(`users/${uid}/followers`, (ref) =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges()
      .pipe(
        switchMap((users) => {
          if (users.length) {
            return combineLatest(
              users.map((user) => this.getUserData(user.followerId))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getFollowings(uid: string): Observable<User[]> {
    return this.db
      .collection<Following>(`users/${uid}/follows`, (ref) =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges()
      .pipe(
        switchMap((users) => {
          if (users.length) {
            return combineLatest(
              users.map((user) => this.getUserData(user.followingId))
            );
          } else {
            return of(null);
          }
        })
      );
  }
}
