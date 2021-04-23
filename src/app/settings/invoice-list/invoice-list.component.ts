import { Component, OnInit } from '@angular/core';
import { TransferWithCharge } from 'src/app/interfaces/transfer';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit {
  invoices: TransferWithCharge[];

  constructor(private connectedAccountService: ConnectedAccountService) {
    this.connectedAccountService.getStripeTransfers().then((invoices) => {
      this.invoices = invoices;
    });
  }

  ngOnInit(): void {}
}
