import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectedAccountGuard } from '../guards/connected-account.guard';
import { AccountComponent } from './account/account.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PaymentComponent } from './payment/payment.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'account',
        component: AccountComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
      },
      {
        path: 'payment',
        component: PaymentComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
