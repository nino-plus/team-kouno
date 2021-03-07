import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fade } from 'src/app/animations/animations';
import { Event } from 'src/app/interfaces/event';
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
