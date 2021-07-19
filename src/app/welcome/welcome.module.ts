import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignupComponent } from './signup/signup.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  declarations: [WelcomeComponent, SignupComponent],
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    MatCheckboxModule,
    FooterModule,
  ],
})
export class WelcomeModule {}
