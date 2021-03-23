import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FollowersComponent } from './followers/followers.component';
import { FollowingsComponent } from './followings/followings.component';
import { MyPageComponent } from './my-page/my-page.component';

const routes: Routes = [
  {
    path: '',
    component: MyPageComponent,
  },
  {
    path: 'followers',
    component: FollowersComponent,
  },
  {
    path: 'followings',
    component: FollowingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyPageRoutingModule {}
