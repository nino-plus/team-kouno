import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import Stripe from 'stripe';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-manage-plans',
  templateUrl: './manage-plans.component.html',
  styleUrls: ['./manage-plans.component.scss'],
})
export class ManagePlansComponent implements OnInit {
  prices: Stripe.Price[];
  isRunning: boolean;
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    interval: ['', [Validators.required]],
    amount: [
      '',
      [
        Validators.required,
        Validators.pattern(/\d+/),
        Validators.min(100),
        Validators.max(1000000),
      ],
    ],
    trialPeriodDays: [
      {
        value: 0,
        disabled: true,
      },
      [Validators.required, Validators.pattern(/\d+/), Validators.max(365)],
    ],
  });

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.getAllPrices();
    this.form.get('interval').valueChanges.subscribe((value) => {
      if (value === 'none') {
        this.form.get('trialPeriodDays').disable();
      } else {
        this.form.get('trialPeriodDays').enable();
      }
    });
  }

  private getAllPrices(): void {
    this.paymentService.getStripePricesFromConnectedAccount().then((res) => {
      this.prices = res;
    });
  }

  ngOnInit(): void {}

  createPlan(): void {
    this.snackBar.open('プロダクトとプランを作成しています', null, {
      duration: null,
    });
    this.isRunning = true;
    this.paymentService
      .createStripeProductAndPrice(this.form.value)
      .then(() => {
        this.snackBar.open('作成しました');
        this.form.reset();
        this.getAllPrices();
      })
      .catch((error) => {
        this.snackBar.open('失敗しました');
        console.error(error.message);
      })
      .finally(() => (this.isRunning = false));
  }

  deleteProduct(id: string): void {
    this.paymentService.deleteStripePrice(id).then(() => {
      this.snackBar.open('削除しました');
      this.getAllPrices();
    });
  }
}
