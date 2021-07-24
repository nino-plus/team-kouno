import { environment } from 'src/environments/environment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectedAccount } from '@interfaces/connected-account';
import { TransferWithCharge } from '../interfaces/transfer';
import { tap } from 'rxjs/operators';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectedAccountService {
  accountPortalUrl: string;

  constructor(
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

  async getStripeTransfers(connectedAccountId: string): Promise<any> {
    const callable = this.fns.httpsCallable('getStripeTransfers');
    return callable({
      stripeAccount: connectedAccountId,
    })
      .toPromise()
      .then((res) => {
        if (res === null) {
          return;
        }
        return res.data as TransferWithCharge[];
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
