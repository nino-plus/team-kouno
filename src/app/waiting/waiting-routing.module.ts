import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaitingComponent } from './waiting/waiting.component';

const routes: Routes = [
  {
    path: ':roomId',
    component: WaitingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaitingRoutingModule {}
