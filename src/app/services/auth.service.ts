import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { UserService } from './user.service';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  afUser$: Observable<any> = this.afAuth.user;
  uid: string;
  user$ = this.afAuth.authState.pipe(
    switchMap((afUser) => {
      if (afUser) {
        this.uid = afUser.uid;
        return this.userService.getUserData(afUser.uid);
      } else {
        return of(null);
      }
    }),
    shareReplay(1)
  );

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  async login(snsLoginType?: string): Promise<void> {
    let provider:
      | firebase.auth.GoogleAuthProvider
      | firebase.auth.TwitterAuthProvider
      | firebase.auth.FacebookAuthProvider
      | firebase.auth.GithubAuthProvider = new firebase.auth.GoogleAuthProvider();
    switch (snsLoginType) {
      case 'google':
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'twitter':
        provider = new firebase.auth.TwitterAuthProvider();
        break;
      case 'facebook':
        provider = new firebase.auth.FacebookAuthProvider();
        break;
      case 'github':
        provider = new firebase.auth.GithubAuthProvider();
        break;
      default:
        break;
    }
    provider.setCustomParameters({ prompt: 'select_account' });
    this.afAuth
      .signInWithPopup(provider)
      .finally(() => {
        this.snackBar.open('ログインしました');
      })
      .catch(() => {
        this.snackBar.open('ログイン中にエラーが発生しました。');
      });
  }

  async logout(): Promise<void> {
    this.afAuth
      .signOut()
      .finally(() => {
        this.router.navigateByUrl('/');
      })
      .then(() => {
        this.snackBar.open('ログアウトしました');
      });
  }
}
