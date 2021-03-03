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

@NgModule({
  declarations: [
    PrivacypolicyComponent,
    TermsComponent,
    LegalComponent,
    ContactComponent,
    PressComponent,
    HelpComponent,
    EventstandComponent,
  ],
  imports: [CommonModule, IntlRoutingModule, MatButtonModule, MatIconModule],
})
export class IntlModule {}
