import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaitingRoutingModule } from './waiting-routing.module';
import { WaitingComponent } from './waiting/waiting.component';


@NgModule({
  declarations: [WaitingComponent],
  imports: [
    CommonModule,
    WaitingRoutingModule
  ]
})
export class WaitingModule { }
