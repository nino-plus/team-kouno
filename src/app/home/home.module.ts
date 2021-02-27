import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EventCardComponent } from './event-card/event-card.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { EventCalendarComponent } from './event-calendar/event-calendar.component';
import { FormsModule } from '@angular/forms';
import { CalendarCommonModule, CalendarMonthModule } from 'angular-calendar';
import { CalendarModule } from 'angular-calendar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    HomeComponent,
    EventCardComponent,
    EventDetailDialogComponent,
    EventCalendarComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule,
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarModule,
    MatIconModule,
  ],
})
export class HomeModule {}
