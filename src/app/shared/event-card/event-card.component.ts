import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fade } from 'src/app/animations/animations';
import { Event } from 'src/app/interfaces/event';
import { EventService } from 'src/app/services/event.service';
import { SoundService } from 'src/app/services/sound.service';
import { UiService } from 'src/app/services/ui.service';
import { EventDetailDialogComponent } from '../event-detail-dialog/event-detail-dialog.component';

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

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private eventService: EventService,
    private soundService: SoundService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {}

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
    } else {
      this.navigateDetail(event, $event);
    }
  }
}
