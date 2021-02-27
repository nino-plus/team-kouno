import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event/event.component';
import { EventFormComponent } from './event-form/event-form.component';
import { EventRoomComponent } from './event-room/event-room.component';
import { ChatComponent } from './chat/chat.component';
import { StreamComponent } from './stream/stream.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CropperModule } from '@deer-inc/ngx-croppie';
import { MatSelectModule } from '@angular/material/select';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';

@NgModule({
  declarations: [
    EventComponent,
    EventFormComponent,
    EventRoomComponent,
    ChatComponent,
    StreamComponent,
  ],
  imports: [
    CommonModule,
    EventRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    CropperModule,
    MatSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
})
export class EventModule {}
