import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { UserFollowService } from 'src/app/services/user-follow.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-followings-dialog',
  templateUrl: './followings-dialog.component.html',
  styleUrls: ['./followings-dialog.component.scss'],
})
export class FollowingsDialogComponent implements OnInit {
  targetUserFollowings$: Observable<User[]> = this.userService.getFollowings(
    this.data.targetUid
  );
  myFollowingUids$: Observable<string[]> = this.userService.getFollowings(this.data.authUid).pipe(
    map((users) => {
      if (users) {
        return users.map((user) => user.uid);
      } else {
        return null;
      }
    })
  );

  constructor(
    private userService: UserService,
    public followService: UserFollowService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      authUid: string;
      targetUid: string;
    }
  ) {}

  ngOnInit(): void {}
}
