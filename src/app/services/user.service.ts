import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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

  async updateUser(user: Omit<User, 'createdAt'>): Promise<void> {
    await this.db.doc<User>(`users/${user.uid}`).update({
      ...user,
    });
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
}
