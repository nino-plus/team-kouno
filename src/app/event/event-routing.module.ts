import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventFormComponent } from './event-form/event-form.component';
import { EventComponent } from './event/event.component';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
  },
  {
    path: 'event-form',
    component: EventFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
