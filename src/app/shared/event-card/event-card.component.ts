import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Customer } from '@interfaces/customer';
import { take } from 'rxjs/operators';
import { fade } from 'src/app/animations/animations';
import { Event } from 'src/app/interfaces/event';
import { CustomerService } from 'src/app/services/customer.service';
import { EventService } from 'src/app/services/event.service';
import { UiService } from 'src/app/services/ui.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EventDetailDialogComponent } from '../event-detail-dialog/event-detail-dialog.component';
import { EventStoreComponent } from '../event-store/event-store.component';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  animations: [fade],
})
export class EventCardComponent implements OnInit {
  @Input() event: Event;
  @Input() uid: string;
  @Input() type: string;
  @Input() dbType: string;
  ownerEvents: string[];
  customer: Customer;
  duringEvent: boolean;

  constructor(
    public eventService: EventService,
    private dialog: MatDialog,
    private router: Router,
    private uiService: UiService,
    private customerService: CustomerService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerService
      .getCustomer(this.uid)
      .subscribe((data) => (this.customer = data));
    if (this.dbType) {
      this.duringEvent =
        ((this.event.startAt as unknown) as number) <
          this.eventService.dateNow.toMillis() - 600000 &&
        this.event.exitAt >= this.eventService.dateNow;
    } else {
      this.duringEvent =
        this.event.startAt.toMillis() <
          this.eventService.dateNow.toMillis() - 600000 &&
        this.event.exitAt >= this.eventService.dateNow;
    }
  }

  openDetailDialog(event: Event, $event): void {
    $event.stopPropagation();
    this.dialog.open(EventDetailDialogComponent, {
      panelClass: 'event-detail-dialog',
      data: {
        event,
        uid: this.uid,
        type: this.type,
      },
    });
  }

  navigateDetail(event: Event, $event): void {
    $event.stopPropagation();
    let userType;
    if (event.ownerId === this.uid) {
      userType = 'owner';
    }
    this.router.navigate([`/event/${event.eventId}`], {
      queryParams: { type: userType },
    });
  }

  joinChannel(event: Event, $event): void {
    $event.stopPropagation();
    this.eventService
      .checkPaidUser(event.eventId, this.uid)
      .pipe(take(1))
      .subscribe((bool) => {
        if (bool) {
          this.join(event);
        } else {
          if (
            event.headcountLimit <= event.reserveUserCount ||
            event.headcountLimit <= event.participantCount
          ) {
            this.snackbar.open('このイベントには募集定員一杯です');
          } else {
            if (event.price > 0) {
              this.chackCustomer(event);
            } else {
              this.join(event);
            }
          }
        }
      });
  }

  chackCustomer(event: Event) {
    this.customerService
      .getCustomer(this.uid)
      .pipe(take(1))
      .subscribe((data) => {
        if (data.defaultPaymentMethod || data.paymentMethods) {
          this.dialog
            .open(EventStoreComponent, {
              data: {
                event,
              },
              width: '300px',
            })
            .afterClosed()
            .subscribe(async (status) => {
              if (status) {
                this.join(event);
              }
            });
        } else {
          this.dialog
            .open(ConfirmDialogComponent, {
              data: {
                text: `このイベントに参加するにはチケットが必要です。\n\nお支払いカードを設定してください。`,
                buttonText: '設定',
              },
              width: '300px',
            })
            .afterClosed()
            .subscribe(async (status) => {
              if (status) {
                this.router.navigate(['/settings/payment']);
              }
            });
        }
      });
  }

  join(event: Event) {
    this.router
      .navigateByUrl(`/event/${event.eventId}/${this.uid}`)
      .then(
        () => (this.uiService.sidenavIsOpen = !this.uiService.sidenavIsOpen)
      );
  }
}
