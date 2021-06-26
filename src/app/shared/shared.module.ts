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
import { RegisterCardComponent } from './register-card/register-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { UserStoreComponent } from './user-store/user-store.component';
import { MatSelectModule } from '@angular/material/select';
import { StripeIntervalPipe } from '../pipes/stripe-interval.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventStoreComponent } from './event-store/event-store.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserSearchBoxComponent } from './user-search-box/user-search-box.component';

@NgModule({
  declarations: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
    ShareScreenInfoDialogComponent,
    DeleteDialogComponent,
    UnfollowDialogComponent,
    RegisterCardComponent,
    ConfirmDialogComponent,
    UserStoreComponent,
    StripeIntervalPipe,
    EventStoreComponent,
    SearchBoxComponent,
    UserSearchBoxComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    MatListModule,
    MatMenuModule,
    MatCardModule,
    ClipboardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  exports: [
    EventCardComponent,
    EventDetailDialogComponent,
    InfoDialogComponent,
    DeleteDialogComponent,
    UnfollowDialogComponent,
    RegisterCardComponent,
    UserStoreComponent,
    StripeIntervalPipe,
    EventStoreComponent,
    SearchBoxComponent,
    UserSearchBoxComponent,
  ],
})
export class SharedModule {}
