import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectedAccount } from '@interfaces/connected-account';
import { TransferWithCharge } from '../interfaces/transfer';

@Injectable({
  providedIn: 'root',
})
export class ConnectedAccountService {
  accountPortalUrl: string;

  constructor(
    private db: AngularFirestore,
    private fns: AngularFireFunctions
  ) {
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

  async getStripeTransfers(): Promise<any>{
    const callable = this.fns.httpsCallable('getStripeTransfers');
    return callable({})
      .toPromise()
      .then((res) => {
        if(res === null) {
          return
        }
        res.data as TransferWithCharge[]});
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
