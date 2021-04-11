import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserFollowService } from 'src/app/services/user-follow.service';
import { UserService } from 'src/app/services/user.service';
import { UnfollowDialogComponent } from 'src/app/shared/unfollow-dialog/unfollow-dialog.component';
import { FollowersDialogComponent } from '../followers-dialog/followers-dialog.component';
import { FollowingsDialogComponent } from '../followings-dialog/followings-dialog.component';
import { MeetingService } from 'src/app/services/meeting.service';
import { InviteWithSender } from 'src/app/intefaces/invite';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
})
export class MyPageComponent implements OnInit, OnDestroy {
  readonly subscription = new Subscription();
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();
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
  followings: User[];
  followers: User[];

  followings$: Observable<User[]> = this.user$.pipe(
    switchMap((user) => {
      return this.userService.getFollowings(user.uid);
    })
  );

  followers$: Observable<User[]> = this.user$.pipe(
    switchMap((user) => {
      return this.userService.getFollowers(user.uid);
    })
  );

  screenWidth = window.innerWidth;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: UserFollowService,
    private dialog: MatDialog,
    private router: Router,
    private meetingService: MeetingService,
    private afAuth: AngularFireAuth
  ) {
    this.followers$.subscribe((users) => {
      this.followers = users;
    });
    this.followings$.subscribe((users) => {
      this.followings = users;
    });
  }

  follow(): void {
    this.isFollowing = true;
    this.followService.follow(this.currentUserUid, this.targetId);
  }

  openUnFollowDialog(): void {
    this.dialog
      .open(UnfollowDialogComponent, {
        width: '250px',
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.isFollowing = false;
          this.followService.unFollow(this.currentUserUid, this.targetId);
        }
      });
  }

  openFollowersDialog(currentUser: User): void {
    this.dialog.open(FollowersDialogComponent, {
      autoFocus: false,
      data: {
        currentUser,
        followers: this.followers,
      },
    });
  }

  openFollowingsDialog(currentUser: User): void {
    this.dialog.open(FollowingsDialogComponent, {
      autoFocus: false,
      data: {
        currentUser,
        followings: this.followings,
      },
    });
  }

  ngOnInit(): void {
    this.targetId = this.route.snapshot.params.uid;
    this.afAuth.user
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
    this.subscription.add(
      this.userService.getUserData(this.targetId).subscribe((user) => {
        if (!user) {
          this.router.navigate(['/404']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
