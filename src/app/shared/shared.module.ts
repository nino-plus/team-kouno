import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from './event-card/event-card.component';
import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
  ],
})
export class SharedModule {}
