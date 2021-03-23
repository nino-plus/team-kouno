import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-followings-dialog',
  templateUrl: './followings-dialog.component.html',
  styleUrls: ['./followings-dialog.component.scss'],
})
export class FollowingsDialogComponent implements OnInit {
  myFollowingUids$: Observable<string[]>;
  followings$: Observable<User[]> = this.userService.getFollowings(
    this.data.currentUser.uid
  );

  constructor(
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: User;
      followings: User[];
    }
  ) {
    this.myFollowingUids$ = this.followings$.pipe(
      map((users) => {
        return users.map((user) => user.uid);
      })
    );
  }

  ngOnInit(): void {}
}
