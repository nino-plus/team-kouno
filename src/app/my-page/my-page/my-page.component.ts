import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserFollowService } from 'src/app/services/user-follow.service';
import { UserService } from 'src/app/services/user.service';
import { UnfollowDialogComponent } from 'src/app/shared/unfollow-dialog/unfollow-dialog.component';
import { FollowersDialogComponent } from '../followers-dialog/followers-dialog.component';
import { FollowingsDialogComponent } from '../followings-dialog/followings-dialog.component';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/interfaces/customer';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MessagingService } from 'src/app/services/messaging.service';
import { UserStoreComponent } from 'src/app/shared/user-store/user-store.component';
import { el } from 'date-fns/locale';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
})
export class MyPageComponent implements OnInit, OnDestroy {
  readonly subscription = new Subscription();
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();
  targetUid: string = this.route.snapshot.params.uid;
  targetUser$: Observable<User> = this.userService.getUserData(this.targetUid);
  authUser$: Observable<User> = this.authService.user$.pipe(
    tap((user) => {
      if (user) {
        this.isFollowing = this.followService.checkFollowing(
          user.uid,
          this.targetUid
        );
      } else {
        return;
      }
    })
  );
  reservedEvents$: Observable<
    Event[]
  > = this.eventService.getFutureReservedEvents(this.targetUid);
  pastEvents$: Observable<Event[]> = this.eventService.getPastReservedEvents(
    this.targetUid
  );
  ownerEvents$: Observable<Event[]> = this.eventService.getOwnerEvents(
    this.targetUid
  );
  targetUserFollowings$: Observable<User[]> = this.userService.getFollowings(
    this.targetUid
  );
  targetUserFollowers$: Observable<User[]> = this.userService.getFollowers(
    this.targetUid
  );
  customer$: Observable<Customer> = this.customerService.getCustomer(
    this.targetUid
  );
  isFollowing: Observable<boolean>;

  isReserveOneOnOneBtn?: boolean = this.route.snapshot.queryParams.reserve;
  tokens: string[] = [];
  screenWidth = window.innerWidth;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: UserFollowService,
    private dialog: MatDialog,
    private router: Router,
    private customerService: CustomerService,
    private meetingService: MeetingService,
    private messagingService: MessagingService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserData(this.targetUid).subscribe((user) => {
        if (!user) {
          this.router.navigate(['/404']);
        }
      })
    );
  }

  follow(authUid: string): void {
    this.followService.follow(authUid, this.targetUid);
  }

  unFollow(authUid: string): void {
    this.followService.unFollow(authUid, this.targetUid);
  }

  openFollowersDialog(uid: string): void {
    this.dialog.open(FollowersDialogComponent, {
      width: '400px',
      autoFocus: false,
      data: {
        authUid: uid,
        targetUid: this.targetUid,
      },
    });
  }

  openFollowingsDialog(uid: string): void {
    this.dialog.open(FollowingsDialogComponent, {
      width: '400px',
      autoFocus: false,
      data: {
        authUid: uid,
        targetUid: this.targetUid,
      },
    });
  }

  openTicketDialog(authUid: string, targetUser: User): void {
    this.dialog.open(UserStoreComponent, {
      data: {
        authUid,
        targetUser: targetUser,
      },
    });
  }

  async sendPushMessage(
    tokens: string[],
    authUser: User,
    roomId: string
  ): Promise<void> {
    this.messagingService.sendPushMessage(tokens, authUser, roomId);
  }

  call(uid: string, authUser: User, userName: string): void {
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
            this.sendPushMessage(this.tokens, authUser, roomId);
          });

          this.router.navigate(['meeting', roomId]);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
