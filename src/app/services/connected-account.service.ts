import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectedAccount } from '@interfaces/connected-account';
import { TransferWithCharge } from '../interfaces/transfer';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { UiService } from './ui.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ConnectedAccountService {
  accountPortalUrl: string;

  connectedAccount: ConnectedAccount;
  connectedAccountId$: Observable<string> = this.afAuth.user.pipe(
    switchMap((user) => {
      return this.db
        .doc<ConnectedAccount>(`connectedAccounts/${user.uid}`)
        .valueChanges();
    }),
    tap((account) => (this.connectedAccount = account)),
    map((account) => account?.connectedAccountId),
    tap((accountId) => {
      console.log('run!');

      if (accountId) {
        this.setAccountLoginLink();
      } else {
        this.accountPortalUrl = null;
      }
    }),
    shareReplay(1)
  );

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private fns: AngularFireFunctions,
    private uiService: UiService
  ) {}

  async createStripeConnectedAccount(): Promise<void> {
    this.uiService.loading = true;
    const redirectURL = location.href;
    const callable = this.fns.httpsCallable('getStripeConnectedAccountState');
    const state = await callable({ redirectURL: redirectURL }).toPromise();
    const url = 'https://connect.stripe.com/express/oauth/authorize';
    location.href = `${url}?client_id=${environment.stripe.clientId}&state=${state}&suggested_capabilities[]=transfers`;
  }

  async setAccountLoginLink(): Promise<void> {
    const callable = this.fns.httpsCallable('getStripeAccountLoginLink');
    this.accountPortalUrl = await callable({})
      .toPromise()
      .then((res) => res.url);
  }

  async getStripeTransfers(): Promise<any> {
    const callable = this.fns.httpsCallable('getStripeTransfers');
    return callable({})
      .toPromise()
      .then((res) => {
        if (res === null) {
          return;
        }
        res.data as TransferWithCharge[];
      });
  }

  orderPayout(): Promise<any> {
    const callable = this.fns.httpsCallable('payoutToStripeAccount');
    return callable({}).toPromise();
  }

  getConnectedAccount(uid: string): Observable<ConnectedAccount> {
    return this.db
      .doc<ConnectedAccount>(`connectedAccounts/${uid}`)
      .valueChanges();
  }
}
