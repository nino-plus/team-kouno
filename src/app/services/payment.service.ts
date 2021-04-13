import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  loadStripe,
  Stripe as StripeClient,
  StripeCardElement,
} from '@stripe/stripe-js';
import Stripe from 'stripe';
import { PriceWithProduct } from '../interfaces/price';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(
    private fns: AngularFireFunctions,
    private snackBar: MatSnackBar
  ) {}

  async getStripeClient(): Promise<StripeClient> {
    return loadStripe(environment.stripe.publicKey);
  }

  private createStripeSetupIntent(): Promise<Stripe.SetupIntent> {
    const callable = this.fns.httpsCallable('createStripeSetupIntent');
    return callable({}).toPromise();
  }

  // getStripePricesFromPlatform(): Promise<PriceWithProduct[]> {
  //   const callable = this.fns.httpsCallable('getStripePrices');

  //   return Promise.all(
  //     environment.plans.map((plan) =>
  //       callable({ product: plan.id }).toPromise()
  //     )
  //   );
  // }

  async setPaymentMethod(
    client: StripeClient,
    card: StripeCardElement,
    name: string,
    email: string
  ): Promise<void> {
    const intent = await this.createStripeSetupIntent();
    const { setupIntent, error } = await client.confirmCardSetup(
      intent.client_secret,
      {
        payment_method: {
          card,
          billing_details: {
            name,
            email,
          },
        },
      }
    );
    if (error) {
      throw new Error(error.code);
    } else {
      if (setupIntent.status === 'succeeded') {
        const callable = this.fns.httpsCallable('setStripePaymentMethod');
        return callable({
          paymentMethod: setupIntent.payment_method,
        }).toPromise();
      }
    }
  }

  getPaymentMethods(): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    const callable = this.fns.httpsCallable('getStripePaymentMethod');
    return callable({}).toPromise();
  }

  async charge(priceId: string, connectedAccountId?: string): Promise<void> {
    const callable = this.fns.httpsCallable('payStripeProduct');
    const process = this.snackBar.open('決済を開始します', null, {
      duration: null,
    });
    return callable({
      priceId,
      connectedAccountId,
    })
      .toPromise()
      .then(() => {
        this.snackBar.open('決済成功');
      })
      .catch((error) => {
        console.error(error?.message);
        this.snackBar.open('決済失敗');
      })
      .finally(() => {
        process.dismiss();
      });
  }

  async createStripeSubscription(
    priceId: string,
    couponId?: string,
    stripeAccount?: string
  ): Promise<void> {
    const callable = this.fns.httpsCallable('createStripeSubscription');
    return callable({
      priceId,
      couponId,
      stripeAccount,
    }).toPromise();
  }

  restartStripeSubscription(subscriptionId: string): Promise<any> {
    const callable = this.fns.httpsCallable('restartStripeSubscription');
    return callable(subscriptionId).toPromise();
  }

  cancelStripeSubscription(subscriptionId: string): Promise<any> {
    const callable = this.fns.httpsCallable('cancelStripeSubscription');
    return callable(subscriptionId).toPromise();
  }

  deleteSubscription(subscriptionId: string): Promise<any> {
    this.snackBar.open('課金を停止しています', null, {
      duration: 2000,
    });
    const callable = this.fns.httpsCallable('deleteSubscription');
    return callable(subscriptionId)
      .toPromise()
      .then(() => {
        this.snackBar.open('課金を停止しました');
      });
  }

  deleteStripePaymentMethod(id: string): Promise<void> {
    const callable = this.fns.httpsCallable('deleteStripePaymentMethod');
    return callable({ id }).toPromise();
  }

  getStripePricesFromConnectedAccount(): Promise<Stripe.Price[]> {
    const callable = this.fns.httpsCallable(
      'getStripePricesFromConnectedAccount'
    );
    return callable({}).toPromise();
  }

  createStripeProductAndPrice(data): Promise<Stripe.Price[]> {
    const callable = this.fns.httpsCallable('createStripeProductAndPrice');
    return callable(data).toPromise();
  }

  deleteStripePrice(productId: string): Promise<Stripe.Price[]> {
    const callable = this.fns.httpsCallable('deleteStripePrice');
    return callable(productId).toPromise();
  }

  chargeToConnectedAccount(): Promise<void> {
    const process = this.snackBar.open('決済開始', null, { duration: null });
    const callable = this.fns.httpsCallable('chargeToConnectedAccount');
    return callable({})
      .toPromise()
      .then(() => {
        this.snackBar.open('決済成功');
      })
      .catch((error) => {
        console.error(error?.message);
        this.snackBar.open('決済失敗');
      })
      .finally(() => process.dismiss());
  }

  async setDefaultMethod(id: string): Promise<void> {
    const callable = this.fns.httpsCallable('setStripeDefaultPaymentMethod');
    await callable({ id }).toPromise();
    this.snackBar.open('デフォルトのカードに設定しました');
  }

  getCoupons(): Promise<Stripe.Coupon[]> {
    const callable = this.fns.httpsCallable('getAllStripeCoupons');
    return callable({}).toPromise();
  }
}
