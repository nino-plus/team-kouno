import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import Stripe from 'stripe';

@Component({
  selector: 'app-user-store',
  templateUrl: './user-store.component.html',
  styleUrls: ['./user-store.component.scss'],
})
export class UserStoreComponent implements OnInit {
  items: Stripe.Price[];

  constructor(
    private paymentService: PaymentService,
    private connectedaccountService: ConnectedAccountService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllPrices();
  }

  private getAllPrices(): void {
    this.paymentService.getStripePricesFromConnectedAccount().then((res) => {
      this.items = res.filter((item) => !item.recurring);
    });
  }

  charge(id: string): void {
    this.paymentService.charge(
      id,
      this.connectedaccountService.connectedAccount.connectedAccountId
    );
  }
}
