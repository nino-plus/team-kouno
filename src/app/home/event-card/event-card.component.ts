import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { EventDetailDialogComponent } from '../event-detail-dialog/event-detail-dialog.component';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit {
  @Input() event: Event;
  @Input() uid: string;

  constructor(private dialog: MatDialog) {}

  openDetailDialog(event: Event): void {
    this.dialog.open(EventDetailDialogComponent, {
      data: {
        event,
        uid: this.uid,
      },
    });
  }

  ngOnInit(): void {}
}
