import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserFollowService } from 'src/app/services/user-follow.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
})
export class MyPageComponent implements OnInit {
  dateNow: firebase.default.firestore.Timestamp = firebase.default.firestore.Timestamp.now();
  user$: Observable<User> = this.route.paramMap.pipe(
    switchMap((params) => {
      return this.userService.getUserData(params.get('uid'));
    })
  );
  user: User;
  currentUser$: Observable<User> = this.authService.user$;
  currentUserUid: string;
  reservedEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getFutureReservedEvents(user.uid);
    })
  );
  pastEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getPastReservedEvents(user.uid);
    })
  );
  ownerEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getOwnerEvents(user.uid);
    })
  );
  targetId: string;
  isFollowing: boolean;
  uid: string;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: UserFollowService
  ) {}

  follow(): void {
    this.isFollowing = true;
    this.followService.follow(this.currentUserUid, this.targetId);
  }

  unFollow(): void {
    this.isFollowing = false;
    this.followService.unFollow(this.currentUserUid, this.targetId);
  }

  ngOnInit(): void {
    this.targetId = this.route.snapshot.params.uid;
    this.currentUser$
      .pipe(
        take(1),
        map((user) => user.uid)
      )
      .toPromise()
      .then((uid) => {
        this.currentUserUid = uid;
        this.followService
          .checkFollowing(this.currentUserUid, this.targetId)
          .then((isFollowing) => (this.isFollowing = isFollowing));
      });
  }
}
