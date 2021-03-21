import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { EventService } from 'src/app/services/event.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.scss'],
})
export class EventDetailDialogComponent implements OnInit {
  reservedUsers$: Observable<User[]> = this.eventService.getReservedUsers(
    this.data.event.eventId
  );
  reservedUids$: Observable<string[]> = this.eventService.getReaservedUids(
    this.data.event.eventId
  );
  owner$: Observable<User>;

  constructor(
    private router: Router,
    public eventService: EventService,
    private dialog: MatDialog,
    private userService: UserService,
    public uiService: UiService,
    private snackBer: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      event: Event;
      uid?: string;
      type?: string | undefined;
    }
  ) {}

  ngOnInit(): void {
    this.owner$ = this.userService.getUserData(this.data.event.ownerId);
  }

  reserveEvent(event: Event): void {
    this.eventService.reserveEvent(event, this.data.uid);
  }

  cancelReserve(event: Event): void {
    this.eventService.cancelReserve(event, this.data.uid);
  }

  joinChannel(eventId: string, uid: string): void {
    if (this.data.event.startAt < this.eventService.dateNow) {
      this.router.navigateByUrl(`/event/${eventId}/${uid}`);
    }
  }

  navigateMyPage(uid: string): void {
    this.router.navigateByUrl(`${uid}`);
    this.dialog.closeAll();
  }

  openDeleteDialog(eventId): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '250px',
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.eventService
            .deleteEvent(eventId);
        }
      });
  }

  navigateEditor(event: Event): void {
    this.router.navigateByUrl(`/editor/${event.eventId}`);
    this.dialog.closeAll();
  }

  openInfoDialog(): void {
    this.dialog.open(InfoDialogComponent);
  }

}
