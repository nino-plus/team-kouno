import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchComponent } from './search/search.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserSearchComponent } from './user-search/user-search.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SearchHeaderComponent } from './search-header/search-header.component';
import { MatMenuModule } from '@angular/material/menu';
import { UserSearchHeaderComponent } from './user-search-header/user-search-header.component';
import { UserSearchResultComponent } from './user-search-result/user-search-result.component';
import { UserCardComponent } from './user-card/user-card.component';

@NgModule({
  declarations: [
    SearchResultComponent,
    SearchComponent,
    UserSearchComponent,
    SearchHeaderComponent,
    UserSearchHeaderComponent,
    UserSearchResultComponent,
    UserCardComponent,
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    InfiniteScrollModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatMenuModule,
  ],
})
export class SearchModule {}
