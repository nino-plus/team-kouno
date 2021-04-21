import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-user-store',
  templateUrl: './user-store.component.html',
  styleUrls: ['./user-store.component.scss'],
})
export class UserStoreComponent implements OnInit {
  products$: Observable<Product[]> = this.productService.getActiveProducts(
    this.data.user.uid
  );
  user: User = this.data.user;
  constructor(
    private paymentService: PaymentService,
    private productService: ProductService,
    public uiService: UiService,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {}

  charge(ticket: Product): void {
    this.paymentService.charge(ticket);
  }
}
