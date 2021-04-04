import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from './event-card/event-card.component';
import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShareScreenInfoDialogComponent } from './share-screen-info-dialog/share-screen-info-dialog.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { UnfollowDialogComponent } from './unfollow-dialog/unfollow-dialog.component';
import { RouterModule } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserCardComponent } from './user-card/user-card.component';

@NgModule({
  declarations: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
    ShareScreenInfoDialogComponent,
    DeleteDialogComponent,
    UnfollowDialogComponent,
    UserListComponent,
    UserCardComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
  ],
  exports: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
    DeleteDialogComponent,
    UnfollowDialogComponent,
    UserListComponent,
  ],
})
export class SharedModule {}
