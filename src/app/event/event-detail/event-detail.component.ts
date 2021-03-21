import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
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

  user$: Observable<User> = this.authService.user$;

  constructor(
    private router: Router,
    public eventService: EventService,
    private dialog: MatDialog,
    private userService: UserService,
    public uiService: UiService,
    private route: ActivatedRoute,
    private authService: AuthService
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

  deleteEvent(event): void {
    this.eventService.deleteEvent(event);
  }
}
