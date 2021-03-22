import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-followers-dialog',
  templateUrl: './followers-dialog.component.html',
  styleUrls: ['./followers-dialog.component.scss'],
})
export class FollowersDialogComponent implements OnInit {
  myFollowerUids$: Observable<string[]>;
  followers$: Observable<User[]> = this.userService.getFollowers(
    this.data.currentUser.uid
  );

  constructor(
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUser: User;
      followers: User[];
    }
  ) {
    this.myFollowerUids$ = this.followers$.pipe(
      map((users) => {
        return users.map((user) => user.uid);
      })
    );
  }

  ngOnInit(): void {}
}
