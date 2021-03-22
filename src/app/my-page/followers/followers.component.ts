import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss'],
})
export class FollowersComponent implements OnInit {
  currentUser$: Observable<User> = this.authService.user$;
  targetUid: string = this.route.parent.snapshot.params.uid;
  myFollowerUids$: Observable<string[]>;

  myFollowers$: Observable<User[]> = this.currentUser$.pipe(
    switchMap((user) => {
      return this.userService.getFollowers(user.uid);
    })
  );

  followers$: Observable<User[]> = this.userService.getFollowers(
    this.targetUid
  );

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.myFollowerUids$ = this.myFollowers$.pipe(
      map((users) => {
        return users.map((user) => user.uid);
      })
    );
  }

  ngOnInit(): void {}

  backLocation(): void {
    this.location.back();
  }
}
