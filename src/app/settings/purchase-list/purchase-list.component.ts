import { ChargeWithInvoice } from './../../interfaces/charge';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  charges: ChargeWithInvoice[];
  startingAfter: string;
  endingBefore: string;
  page = 0;
  hasNext: boolean;
  loading: boolean;

  constructor(private customerService: CustomerService) {
    this.getCharges();
  }

  ngOnInit(): void {}

  getCharges(params?: { startingAfter?: string; endingBefore?: string }): void {
    this.loading = true;
    this.customerService.getInvoices(params).then((result) => {
      this.hasNext = !!params?.endingBefore || result?.has_more;
      this.charges = result?.data;
      this.loading = false;
    });
  }

  nextPage(): void {
    this.page++;
    this.getCharges({
      startingAfter: this.charges[this.charges.length - 1].id,
    });
  }

  prevPage(): void {
    this.page--;
    this.getCharges({
      endingBefore: this.charges[0].id,
    });
  }
}
