import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Event } from 'src/app/interfaces/event';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.scss'],
})
export class EventDetailDialogComponent implements OnInit {
  constructor(
    private router: Router,
    private eventService: EventService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      event: Event;
      uid?: string;
    }
  ) {}

  ngOnInit(): void {
    console.log(this.data.uid);
  }

  reserveEvent(event: Event): void {
    this.eventService.reserveEvent(event, this.data.uid);
  }

  joinChannel(eventId: string, uid: string): void {
    this.router.navigateByUrl(`/event/${eventId}/${uid}`);
  }
}
