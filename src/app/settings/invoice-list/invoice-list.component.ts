import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransferWithCharge } from 'src/app/interfaces/transfer';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit {
  connectedAccountId: string;
  invoices: TransferWithCharge[];

  constructor(
    private connectedAccountService: ConnectedAccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.connectedAccountService
      .getConnectedAccount(this.authService.uid)
      .subscribe((data) => {
        const id = data.connectedAccountId;
        this.connectedAccountService
          .getStripeTransfers(id)
          .then((_invoices) => {
            this.invoices = _invoices;
          });
      });
  }
}
