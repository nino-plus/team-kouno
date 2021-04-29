import { Component, OnInit } from '@angular/core';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { CustomerService } from 'src/app/services/customer.service';
import Stripe from 'stripe';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss'],
})
export class PayoutComponent implements OnInit {
  balance: Stripe.Balance;
  available: number;
  pending: number;
  fixedFee = 450;
  dynamicFee: number;
  totalFee: number;
  feeTax: number;
  payoutAmount: number;
  loading = true;

  constructor(private customerService: CustomerService, public connectedAccountService: ConnectedAccountService) {
    this.customerService.getBalance().then((balance) => {
      if(!balance) {
        return this.loading = false;
      }
      this.balance = balance;
      this.available = balance.available.length
        ? balance.available[0].amount
        : 0;
      this.pending = balance.pending.length ? balance.pending[0].amount : 0;
      this.dynamicFee = Math.round(this.available * 0.0025);
      this.totalFee = this.fixedFee + this.dynamicFee;
      this.feeTax = Math.floor(this.totalFee * 0.1);
      this.payoutAmount = Math.max(
        this.available - this.totalFee - this.feeTax,
        0
      );
      this.loading = false;
    });
  }

  ngOnInit(): void {}
}
