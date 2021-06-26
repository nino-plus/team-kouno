import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { UserSearchComponent } from './user-search/user-search.component';

const routes: Routes = [
  {
    path: `event`,
    component: SearchComponent,
  },
  {
    path: 'user',
    component: UserSearchComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule {}
