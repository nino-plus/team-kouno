import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-followings',
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.scss'],
})
export class FollowingsComponent implements OnInit {
  currentUser$: Observable<User> = this.authService.user$;
  targetUid: string = this.route.parent.snapshot.params.uid;
  myFollowingUids$: Observable<string[]>;

  myFollowings$: Observable<User[]> = this.currentUser$.pipe(
    switchMap((user) => {
      return this.userService.getFollowings(user.uid);
    })
  );

  followings$: Observable<User[]> = this.userService.getFollowings(
    this.targetUid
  );

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.myFollowingUids$ = this.myFollowings$.pipe(
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
