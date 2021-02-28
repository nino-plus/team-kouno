import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './event/event.component';
import { StreamComponent } from './stream/stream.component';
import { EventFormComponent } from './event-form/event-form.component';
import { EventRoomComponent } from './event-room/event-room.component';
import { RoomGuard } from '../guards/room.guard';

const routes: Routes = [
  {
    path: 'event-form',
    component: EventFormComponent,
  },
  {
    path: ':channelId/:uid',
    component: EventRoomComponent,
    canDeactivate: [RoomGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    component: EventComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
