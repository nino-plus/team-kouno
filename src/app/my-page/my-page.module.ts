import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPageRoutingModule } from './my-page-routing.module';
import { MyPageComponent } from './my-page/my-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ParticipateEventComponent } from './participate-event/participate-event.component';
import { MyEventComponent } from './my-event/my-event.component';

@NgModule({
  declarations: [MyPageComponent, ParticipateEventComponent, MyEventComponent],
  imports: [CommonModule, MyPageRoutingModule, MatTabsModule, MatIconModule],
})
export class MyPageModule {}
