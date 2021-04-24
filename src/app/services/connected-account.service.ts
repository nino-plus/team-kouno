import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, shareReplay } from 'rxjs/operators';
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
  connectedAccountId = [];
  connectedAccountId$: Observable<ConnectedAccount> = this.afAuth.user.pipe(
    switchMap((user) => {
      return this.db
        .doc<ConnectedAccount>(`connectedAccounts/${user.uid}`)
        .valueChanges();
    }),
    shareReplay(1)
  );

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private fns: AngularFireFunctions
  ) {
    this.connectedAccountId$ = this.afAuth.user.pipe(
      switchMap((user) => {
        return this.db
          .doc<ConnectedAccount>(`connectedAccounts/${user.uid}`)
          .valueChanges();
      }),
    );
    this.connectedAccountId$.subscribe((account) => {
      this.connectedAccountId.push(account.connectedAccountId);
    });
  }

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
    if (this.connectedAccountId[0]) {
      return callable({
        stripeAccount: this.connectedAccountId[0],
      })
        .toPromise()
        .then((res) => res.data as TransferWithCharge[]);
    }
  }

  getBalance(): Promise<Stripe.Balance> {
    const callable = this.fns.httpsCallable('getStripeAccountBalance');
    return callable({
      stripeAccount: this.connectedAccountId[0],
    }).toPromise();
  }

  orderPayout(): Promise<any> {
    const callable = this.fns.httpsCallable('payoutToStripeAccount');
    return callable({
      stripeAccount: this.connectedAccountId[0],
    }).toPromise();
  }

  getConnectedAccount(uid: string): Observable<ConnectedAccount> {
    return this.db
      .doc<ConnectedAccount>(`connectedAccounts/${uid}`)
      .valueChanges();
  }
}
