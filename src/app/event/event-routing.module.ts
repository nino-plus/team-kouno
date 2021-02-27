import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './event/event.component';
import { StreamComponent } from './stream/stream.component';

const routes: Routes = [
  {
    path: ':channelId/:uid',
    component: StreamComponent,
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
