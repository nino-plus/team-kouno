import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'event',
    loadChildren: () =>
      import('./event/event.module').then((m) => m.EventModule),
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'settings',
    pathMatch: 'full',
    loadChildren: () =>
      import('./Settings/Settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'event',
    loadChildren: () =>
      import('./event/event.module').then((m) => m.EventModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
