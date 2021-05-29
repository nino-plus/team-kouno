import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventShellComponent } from './event-shell/event-shell.component';
import { MaintenanceGuard } from './guards/maintenance.guard';
import { MainShellComponent } from './main-shell/main-shell.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: 'welcome',
    canActivate: [MaintenanceGuard],
    canLoad: [MaintenanceGuard],
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
  },
  {
    path: '',
    canActivate: [MaintenanceGuard],
    canLoad: [MaintenanceGuard],
    component: MainShellComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./search/search.module').then((m) => m.SearchModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'intl',
        loadChildren: () =>
          import('./intl/intl.module').then((m) => m.IntlModule),
      },
      {
        path: 'editor',
        loadChildren: () =>
          import('./editor/editor.module').then((m) => m.EditorModule),
      },
      {
        path: 'meeting/:roomId',
        loadChildren: () =>
          import('./meeting/meeting.module').then((m) => m.MeetingModule),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./event-calendar/event-calendar.module').then(
            (m) => m.EventCalendarModule
          ),
      },
      {
        path: 'waiting',
        loadChildren: () =>
          import('./waiting/waiting.module').then((m) => m.WaitingModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users.module').then((m) => m.UsersModule),
      },
      {
        path: '404',
        component: NotFoundComponent,
      },
      {
        path: ':uid',
        loadChildren: () =>
          import('./my-page/my-page.module').then((m) => m.MyPageModule),
      },
    ],
  },
  {
    path: 'event',
    canActivate: [MaintenanceGuard],
    canLoad: [MaintenanceGuard],
    component: EventShellComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./event/event.module').then((m) => m.EventModule),
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
