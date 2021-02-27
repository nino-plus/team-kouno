import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event/event.component';
import { EventFormComponent } from './event-form/event-form.component';
import { EventRoomComponent } from './event-room/event-room.component';
import { ChatComponent } from './chat/chat.component';
import { StreamComponent } from './stream/stream.component';


@NgModule({
  declarations: [EventComponent, EventFormComponent, EventRoomComponent, ChatComponent, StreamComponent],
  imports: [
    CommonModule,
    EventRoutingModule
  ]
})
export class EventModule { }
