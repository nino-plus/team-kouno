import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Event } from 'src/app/interfaces/event';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.scss'],
})
export class EventDetailDialogComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      event: Event;
      uid: string;
    }
  ) {}

  ngOnInit(): void {}

  reserveEvent(event: Event): void {}

  joinChannel(eventId: string, uid: string): void {
    this.router.navigateByUrl(`/event/${eventId}/${uid}`);
  }
}
