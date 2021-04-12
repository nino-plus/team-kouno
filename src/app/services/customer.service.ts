import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { switchMap, tap, shareReplay } from 'rxjs/operators';
import { Customer } from '@interfaces/customer';
import { Observable, of, ReplaySubject } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
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
  private stripeCustomerSource$: Observable<Stripe.Customer> = this.customer$.pipe(
    switchMap((customer) => {
      if (customer) {
        const callable = this.fns.httpsCallable('getStripeCustomer');
        return callable(null);
      } else {
        return of(null);
      }
    }),
    tap((customer: Stripe.Customer) => {
      if (customer) {
        this.getStripeCustomerPortalURL();
      } else {
        this.customerPortalUrl = null;
      }
    })
  );

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private fns: AngularFireFunctions,
    private ngZone: NgZone
  ) {
    this.stripeCustomerSource$.subscribe((customer) => {
      this.ngZone.run(() => {
        this.stripeCustomer = customer;
      });
    });
  }

  async getStripeCustomerPortalURL() {
    const callable = this.fns.httpsCallable('getStripeCustomerPortalURL');
    this.ngZone.run(async () => {
      this.customerPortalUrl = await callable({})
        .toPromise()
        .catch((error) => {
          console.error(error);
        });
    });
  }

  getBalance() {
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
}
