import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, tap, shareReplay, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectedAccount } from '@interfaces/connected-account';
import Stripe from 'stripe';
import { TransferWithCharge } from '../interfaces/transfer';

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
    private fns: AngularFireFunctions
  ) {}

  async createStripeConnectedAccount(): Promise<void> {
    const callable = this.fns.httpsCallable('getStripeConnectedAccountState');
    const state = await callable({}).toPromise();
    const url = 'https://connect.stripe.com/express/oauth/authorize';
    location.href = `${url}?client_id=${environment.stripe.clientId}&state=${state}&suggested_capabilities[]=transfers`;
  }

  async setAccountLoginLink(): Promise<void> {
    const callable = this.fns.httpsCallable('getStripeAccountLoginLink');
    this.accountPortalUrl = await callable({})
      .toPromise()
      .then((res) => res.url);
  }

  async getStripeTransfers(): Promise<TransferWithCharge[]> {
    const callable = this.fns.httpsCallable('getStripeTransfers');
    return callable({
      stripeAccount: this.connectedAccount.connectedAccountId,
    })
      .toPromise()
      .then((res) => res.data as TransferWithCharge[]);
  }

  getBalance(): Promise<Stripe.Balance> {
    const callable = this.fns.httpsCallable('getStripeAccountBalance');
    return callable({
      stripeAccount: this.connectedAccount.connectedAccountId,
    }).toPromise();
  }

  orderPayout(): Promise<any> {
    const callable = this.fns.httpsCallable('payoutToStripeAccount');
    return callable({
      stripeAccount: this.connectedAccount.connectedAccountId,
    }).toPromise();
  }
}
