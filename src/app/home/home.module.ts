import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CalendarCommonModule,
  CalendarModule,
  CalendarMonthModule,
} from 'angular-calendar';
import { FooterComponent } from '../footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { EventCalendarComponent } from './event-calendar/event-calendar.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { SpecialComponent } from './special/special.component';
import { SwiperModule } from 'swiper/angular';
import { EventListComponent } from './event-list/event-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    EventCalendarComponent,
    FooterComponent,
    SpecialComponent,
    EventListComponent,
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
    MatIconModule,
    CalendarModule,
    MatTooltipModule,
    SharedModule,
    SwiperModule,
  ],
})
export class HomeModule {}
