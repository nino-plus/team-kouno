import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPageRoutingModule } from './my-page-routing.module';
import { MyPageComponent } from './my-page/my-page.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [MyPageComponent],
  imports: [CommonModule, MyPageRoutingModule, MatTabsModule],
})
export class MyPageModule {}
