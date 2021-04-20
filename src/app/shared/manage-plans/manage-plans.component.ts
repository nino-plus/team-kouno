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
    amount: [
      '',
      [
        Validators.required,
        Validators.pattern(/\d+/),
        Validators.min(100),
        Validators.max(1000000),
      ],
    ],
  });

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {}

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
      })
      .catch((error) => {
        this.snackBar.open('失敗しました');
        console.error(error.message);
      })
      .finally(() => (this.isRunning = false));
  }
}
