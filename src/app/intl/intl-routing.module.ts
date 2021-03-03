import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { EventstandComponent } from './eventstand/eventstand.component';
import { HelpComponent } from './help/help.component';
import { LegalComponent } from './legal/legal.component';
import { PressComponent } from './press/press.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntlRoutingModule {}
