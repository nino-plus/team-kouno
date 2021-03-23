import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPageRoutingModule } from './my-page-routing.module';
import { MyPageComponent } from './my-page/my-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MyEventComponent } from './my-event/my-event.component';
import { SharedModule } from '../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { FollowersDialogComponent } from './followers-dialog/followers-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FollowingsDialogComponent } from './followings-dialog/followings-dialog.component';
import { FollowersComponent } from './followers/followers.component';
import { FollowingsComponent } from './followings/followings.component';

@NgModule({
  declarations: [MyPageComponent, MyEventComponent, FollowersDialogComponent, FollowingsDialogComponent, FollowersComponent, FollowingsComponent],
  imports: [
    CommonModule,
    MyPageRoutingModule,
    MatTabsModule,
    MatIconModule,
    SharedModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
  ],
})
export class MyPageModule {}
