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

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private eventService: EventService,
    private uiService: UiService,
    private customerService: CustomerService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerService
      .getCustomer(this.uid)
      .subscribe((data) => (this.customer = data));
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
    if (this.dbType === 'algolia') {
      this.navigateDetail(event, $event);
    } else {
      this.eventService
        .checkPaidUser(event.eventId, this.uid)
        .pipe(take(1))
        .subscribe((bool) => {
          if (bool) {
            this.join(event, $event);
          } else {
            if (
              event.headcountLimit <= event.reserveUserCount ||
              event.headcountLimit <= event.participantCount
            ) {
              this.snackbar.open('このイベントには募集定員一杯です');
            } else {
              if (event.price > 0) {
                this.chackCustomer(event, $event);
              } else {
                this.join(event, $event);
              }
            }
          }
        });
    }
  }

  chackCustomer(event: Event, $event) {
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
                this.join(event, $event);
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

  join(event: Event, $event) {
    if (this.uiService.isLargeScreen()) {
      if (
        event.startAt.toMillis() <
          this.eventService.dateNow.toMillis() - 600000 &&
        event.exitAt >= this.eventService.dateNow
      ) {
        this.router
          .navigateByUrl(`/event/${event.eventId}/${this.uid}`)
          .then(
            () => (this.uiService.sidenavIsOpen = !this.uiService.sidenavIsOpen)
          );
      } else {
        this.navigateDetail(event, $event);
      }
    }
  }
}
