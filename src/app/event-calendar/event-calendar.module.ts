import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventCalendarRoutingModule } from './event-calendar-routing.module';
import { EventCalendarComponent } from './event-calendar/event-calendar.component';
import {
  CalendarCommonModule,
  CalendarModule,
  CalendarMonthModule,
} from 'angular-calendar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EventCalendarComponent],
  imports: [
    CommonModule,
    EventCalendarRoutingModule,
    CalendarCommonModule,
    CalendarModule,
    CalendarMonthModule,
    MatIconModule,
  ],
})
export class EventCalendarModule {}
