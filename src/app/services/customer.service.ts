import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { switchMap, shareReplay, take } from 'rxjs/operators';
import { Customer } from '@interfaces/customer';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import Stripe from 'stripe';
import { ChargeWithInvoice } from '../interfaces/charge';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  customerPortalUrl: string;
  customer$: Observable<Customer> = this.afAuth.user.pipe(
    switchMap((user) => {
      if (user) {
        return this.db.doc<Customer>(`customers/${user.uid}`).valueChanges();
      } else {
        return of(null);
      }
    }),
    shareReplay(1)
  );
  stripeCustomer: Stripe.Customer;

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private fns: AngularFireFunctions
  ) {}

  getBalance(): Promise<Stripe.Balance> {
    const callable = this.fns.httpsCallable('getStripeAccountBalance');
    return callable({}).toPromise();
  }

  getInvoices(params?: {
    startingAfter?: string;
    endingBefore?: string;
    stripeAccountId?: string;
  }): Promise<Stripe.ApiList<ChargeWithInvoice>> {
    const callable = this.fns.httpsCallable('getStripeInvoices');
    return callable(params).toPromise();
  }

  getCustomer(userId: string): Observable<Customer> {
    return this.db
      .doc<Customer>(`customers/${userId}`)
      .valueChanges()
      .pipe(shareReplay(1));
  }
}
