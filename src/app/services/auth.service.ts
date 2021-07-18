import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  afUser$: Observable<firebase.User> = this.afAuth.user;
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
  isGuest$: Observable<boolean> = this.afUser$.pipe(
    map((user) => {
      return user.isAnonymous;
    })
  );
  linkedProviders$: Observable<string[]>;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.linkedProviders$ = this.afAuth.user.pipe(
      map((user) => user.providerData.map((uid) => uid.providerId))
    );
  }

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
      .then(() => {
        this.router.navigateByUrl('/');
      })
      .finally(() => {
        this.snackBar.open('ログインしました');
      })
      .catch(() => {
        this.snackBar.open('ログイン中にエラーが発生しました。');
      });
  }

  async guestLogin(): Promise<void> {
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        this.router.navigateByUrl('/');
      })
      .finally(() => {
        this.snackBar.open('ゲストとしてログインしました');
      })
      .catch(() => {
        this.snackBar.open('エラーが発生しました。');
      });
  }

  async logout(): Promise<void> {
    this.afAuth
      .signOut()
      .finally(() => {
        this.router.navigateByUrl('/welcome');
      })
      .then(() => {
        this.snackBar.open('ログアウトしました');
      });
  }

  async linkSns(snsLinkType: string): Promise<void> {
    let provider:
      | firebase.auth.GoogleAuthProvider
      | firebase.auth.TwitterAuthProvider
      | firebase.auth.FacebookAuthProvider
      | firebase.auth.GithubAuthProvider = new firebase.auth.GoogleAuthProvider();
    switch (snsLinkType) {
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
    (await this.afAuth.currentUser)
      .linkWithRedirect(provider)
      .finally(() => {
        this.linkedProviders$ = this.afAuth.user.pipe(
          map((user) => user.providerData.map((uid) => uid.providerId))
        );
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/internal-error':
            alert('アカウント連携に失敗しました。');
            break;
          case 'auth/provider-already-linked':
            alert(
              '既に連携されています。解除する場合はページを更新してもう一度やり直してください。'
            );
            break;
        }
      });
  }

  async unlinkAccount(snsLinkType: string): Promise<void> {
    (await this.afAuth.currentUser)
      .unlink(snsLinkType + '.com')
      .finally(() => {
        this.linkedProviders$ = this.afAuth.user.pipe(
          map((user) => user.providerData.map((uid) => uid.providerId))
        );
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/internal-error':
            alert('アカウント連携に失敗しました。');
            break;
          case 'auth/no-such-provider':
            alert(
              'プロバイダーがみつかりませんでした。連携する場合はページを更新してもう一度やり直してください。'
            );
            break;
        }
      });
  }
}
