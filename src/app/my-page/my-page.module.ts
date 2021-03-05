import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPageRoutingModule } from './my-page-routing.module';
import { MyPageComponent } from './my-page/my-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MyEventComponent } from './my-event/my-event.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [MyPageComponent, MyEventComponent],
  imports: [
    CommonModule,
    MyPageRoutingModule,
    MatTabsModule,
    MatIconModule,
    SharedModule,
  ],
})
export class MyPageModule {}
