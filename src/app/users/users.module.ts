import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { InviteCardComponent } from './invite-card/invite-card.component';
import { LogCardComponent } from './log-card/log-card.component';
import { UserCardComponent } from './user-card/user-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    UserListComponent,
    InviteCardComponent,
    LogCardComponent,
    UserCardComponent,
  ],
  imports: [CommonModule, UsersRoutingModule, MatButtonModule, MatIconModule],
})
export class UsersModule {}
