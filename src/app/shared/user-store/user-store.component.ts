import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { ProductService } from 'src/app/services/product.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-user-store',
  templateUrl: './user-store.component.html',
  styleUrls: ['./user-store.component.scss'],
})
export class UserStoreComponent implements OnInit {
  products$: Observable<Product[]> = this.productService.getOneOnOneProducts(
    this.data.targetUser.uid
  );
  connectedAccountId$: Observable<string> = this.connectedAccountService
    .getConnectedAccount(this.data.targetUser.uid)
    .pipe(map((account) => account.connectedAccountId));

  constructor(
    private productService: ProductService,
    private connectedAccountService: ConnectedAccountService,
    public uiService: UiService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      uid: string;
      targetUser: User;
    }
  ) {}

  ngOnInit(): void {}
}
