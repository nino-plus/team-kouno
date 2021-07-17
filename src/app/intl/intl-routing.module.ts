import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { EventstandComponent } from './eventstand/eventstand.component';
import { HelpComponent } from './help/help.component';
import { IntlComponent } from './intl/intl.component';
import { LegalComponent } from './legal/legal.component';
import { PressComponent } from './press/press.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
  {
    path: '',
    component: IntlComponent,
    children: [
      {
        path: 'eventstand',
        component: EventstandComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'press',
        component: PressComponent,
      },
      {
        path: 'terms',
        component: TermsComponent,
      },
      {
        path: 'legal',
        component: LegalComponent,
      },
      {
        path: 'privacypolicy',
        component: PrivacypolicyComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntlRoutingModule {}
