import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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
import { AngularFireAuth } from '@angular/fire/auth';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/interfaces/customer';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MessagingService } from 'src/app/services/messaging.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { UserStoreComponent } from 'src/app/shared/user-store/user-store.component';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
})
export class MyPageComponent implements OnInit, OnDestroy {
  readonly subscription = new Subscription();
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();
  // uid = this.route.snapshot.paramMap.get('uid');
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

  isReserveOneOnOneBtn?: boolean = this.route.snapshot.queryParams.reserve;
  customer$: Observable<Customer>;

  screenWidth = window.innerWidth;
  tokens: string[] = [];

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: UserFollowService,
    private dialog: MatDialog,
    private router: Router,
    private afAuth: AngularFireAuth,
    private customerService: CustomerService,
    private meetingService: MeetingService,
    private messagingService: MessagingService,
    private fns: AngularFireFunctions
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
        this.customer$ = this.customerService.getCustomer(uid);
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

  async sendPushMessage(
    tokens: string[],
    currentUser: User,
    roomId: string
  ): Promise<void> {
    const callable = this.fns.httpsCallable('sendPushMessage');
    return callable({
      tokens,
      icon: currentUser.avatarURL,
      name: currentUser.name,
      roomId,
    })
      .toPromise()
      .then(() => {
        this.messagingService.receiveMessage();
      });
  }

  call(uid: string, currentUser: User, userName: string): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        autoFocus: false,
        data: {
          text: `${userName}さんに話しかけますか？`,
        },
      })
      .afterClosed()
      .subscribe(async (status) => {
        if (status) {
          const roomId = await this.meetingService.createEmptyRoom(
            this.authService.uid
          );
          this.meetingService.createInvite(uid, roomId, this.authService.uid);
          const tokens$ = this.messagingService.getTokens(uid);
          tokens$.pipe(take(1)).subscribe((tokens) => {
            tokens?.map((token) => this.tokens.push(token?.token));
            this.sendPushMessage(this.tokens, currentUser, roomId);
          });

          this.router.navigate(['meeting', roomId]);
        }
      });
  }

  openTicketDialog(obj: User): void {
    this.dialog.open(UserStoreComponent, {
      data: {
        user: obj,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
