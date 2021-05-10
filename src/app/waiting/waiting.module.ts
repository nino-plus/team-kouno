import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaitingRoutingModule } from './waiting-routing.module';
import { WaitingComponent } from './waiting/waiting.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaitingComponent],
  imports: [
    CommonModule,
    WaitingRoutingModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class WaitingModule {}
