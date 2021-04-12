import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  loadStripe,
  Stripe as StripeClient,
  StripeCardElement,
} from '@stripe/stripe-js';
import { AngularFireFunctions } from '@angular/fire/functions';
import Stripe from 'stripe';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  constructor(private fns: AngularFireFunctions) {}

  async getStripeClient(): Promise<StripeClient> {
    return loadStripe(environment.stripe.publicKey);
  }

  private createStripeSetupIntent(): Promise<Stripe.SetupIntent> {
    const callable = this.fns.httpsCallable('createStripeSetupIntent');
    return callable({}).toPromise();
  }

  async setPaymentMethod(
    client: StripeClient,
    card: StripeCardElement,
    name: string,
    email: string
  ): Promise<void> {
    // 設定フローを作成
    const intent = await this.createStripeSetupIntent();

    // 設定フローに支払方法を添付
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

  async createStripeConnectedAccount(): Promise<void> {
    // ステートを作成&取得
    const callable = this.fns.httpsCallable('getStripeConnectedAccountState');
    const state = await callable({}).toPromise();

    const URL = 'https://connect.stripe.com/express/oauth/authorize';
    // 販売アカウント作成画面へリダイレクト
    location.href = `${URL}?client_id=${environment.stripe.clientId}&state=${state}&suggested_capabilities[]=transfers`;
  }

  createProductAndPrice(data) {
    const callable = this.fns.httpsCallable('createStripeProductAndPrice');
    return;
  }
}
