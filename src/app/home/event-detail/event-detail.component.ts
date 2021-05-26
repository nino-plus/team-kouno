import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Customer } from 'src/app/interfaces/customer';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { EventService } from 'src/app/services/event.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { EventStoreComponent } from 'src/app/shared/event-store/event-store.component';
import { InfoDialogComponent } from 'src/app/shared/info-dialog/info-dialog.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit {
  event$: Observable<Event> = this.route.paramMap.pipe(
    switchMap((params) => {
      const eventId = params.get('eventId');
      return this.eventService.getEvent(eventId);
    })
  );

  reservedUsers$: Observable<User[]> = this.event$.pipe(
    switchMap((event) => {
      return this.eventService.getReservedUsers(event.eventId);
    })
  );

  reservedUids$: Observable<string[]> = this.event$.pipe(
    switchMap((event) => {
      return this.eventService.getReaservedUids(event.eventId);
    })
  );

  owner$: Observable<User> = this.event$.pipe(
    switchMap((event) => {
      return this.userService.getUserData(event.ownerId);
    })
  );

  user$: Observable<User> = this.authService.user$.pipe(
    tap((user) => (this.customer$ = this.customerService.getCustomer(user.uid)))
  );

  customer$: Observable<Customer>;

  type: string = this.route.snapshot.queryParamMap.get('type');

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private customerService: CustomerService,
    public eventService: EventService,
    public uiService: UiService
  ) {}

  ngOnInit(): void {}

  reserveEvent(event: Event, uid: string): void {
    this.eventService.reserveEvent(event, uid);
  }

  cancelReserve(event: Event, uid: string): void {
    this.eventService.cancelReserve(event, uid);
  }

  joinChannel(event: Event, uid: string): void {
    if (event.startAt < this.eventService.dateNow) {
      this.router.navigateByUrl(`/event/${event.eventId}/${uid}`);
    }
  }

  navigateMyPage(uid: string): void {
    this.router.navigateByUrl(`${uid}`);
    this.dialog.closeAll();
  }

  navigateEditor(event: Event): void {
    this.router.navigateByUrl(`/editor/${event.eventId}`);
    this.dialog.closeAll();
  }

  openInfoDialog(): void {
    this.dialog.open(InfoDialogComponent);
  }

  openDeleteDialog(eventId): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '250px',
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.eventService.deleteEvent(eventId);
        }
      });
  }

  openPaymentDialog(event, uid) {
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
          this.joinChannel(event, uid);
        }
      });
  }

  openSettingCard() {
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
}
