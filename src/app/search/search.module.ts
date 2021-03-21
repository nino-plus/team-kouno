import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchComponent } from './search/search.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SearchResultComponent, SearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    InfiniteScrollModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SearchModule {}
