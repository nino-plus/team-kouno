import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '@interfaces/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-event-store',
  templateUrl: './event-store.component.html',
  styleUrls: ['./event-store.component.scss'],
})
export class EventStoreComponent implements OnInit {
  products$: Observable<Product[]> = this.productService.getEventProduct(
    this.data.event.eventId
  );

  connectedAccountId$: Observable<string> = this.connectedAccountService
    .getConnectedAccount(this.data.event.ownerId)
    .pipe(map((account) => account.connectedAccountId));

  constructor(
    private productService: ProductService,
    private connectedAccountService: ConnectedAccountService,
    private paymentService: PaymentService,
    public uiService: UiService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      event: Event;
    },
    private matDialogRef: MatDialogRef<EventStoreComponent>
  ) {}

  async pay(product: Product, connectedAccountId: string) {
    const eventData = {
      eventId: this.data.event.eventId,
    };
    await this.paymentService
      .charge(product, connectedAccountId, eventData)
      .then(() => {
        this.matDialogRef.close(true);
      })
      .catch(() => {
        throw new Error('支払いに失敗しました');
      });
  }

  ngOnInit(): void {}
}
