import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './event/event.component';
import { EventRoomComponent } from './event-room/event-room.component';
import { RoomGuard } from '../guards/room.guard';
import { EventDetailComponent } from './event-detail/event-detail.component';

const routes: Routes = [
  {
    path: ':eventId',
    component: EventDetailComponent,
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
