import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntlRoutingModule } from './intl-routing.module';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { TermsComponent } from './terms/terms.component';
import { LegalComponent } from './legal/legal.component';
import { ContactComponent } from './contact/contact.component';
import { PressComponent } from './press/press.component';
import { HelpComponent } from './help/help.component';
import { EventstandComponent } from './eventstand/eventstand.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AboutComponent } from './about/about.component';
import { IntlComponent } from './intl/intl.component';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  declarations: [
    PrivacypolicyComponent,
    TermsComponent,
    LegalComponent,
    ContactComponent,
    PressComponent,
    HelpComponent,
    EventstandComponent,
    AboutComponent,
    IntlComponent,
  ],
  imports: [
    CommonModule,
    IntlRoutingModule,
    MatButtonModule,
    MatIconModule,
    FooterModule,
  ],
})
export class IntlModule {}
