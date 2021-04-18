import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import Stripe from 'stripe';

@Component({
  selector: 'app-user-store',
  templateUrl: './user-store.component.html',
  styleUrls: ['./user-store.component.scss'],
})
export class UserStoreComponent implements OnInit {
  // items: Stripe.Price[];
  items = this.productService.getActiveProducts(this.data.userId);

  constructor(
    private paymentService: PaymentService,
    private connectedaccountService: ConnectedAccountService,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string }
  ) {}

  ngOnInit(): void {
    // this.getUserPrices();
  }

  // private getUserPrices(): void {
  //   this.paymentService
  //     .getStripePricesFromUserId(this.data.userId)
  //     .then((res) => {
  //       console.log(res);

  //       this.items = res.filter((item) => !item.recurring);
  //     });
  // }

  charge(item): void {
    this.paymentService.charge(item);
  }
}
