import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserFollowService } from 'src/app/services/user-follow.service';
import { UserService } from 'src/app/services/user.service';
import { FollowersDialogComponent } from '../followers-dialog/followers-dialog.component';
import { FollowingsDialogComponent } from '../followings-dialog/followings-dialog.component';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/interfaces/customer';
import { SoundService } from 'src/app/services/sound.service';

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
  user$: Observable<User> = this.authService.user$.pipe(
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
    private soundService: SoundService
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
    this.soundService.decisionSound.play();
    this.followService.follow(authUid, this.targetUid);
  }

  unFollow(authUid: string): void {
    this.soundService.decisionSound.play();
    this.followService.unFollow(authUid, this.targetUid);
  }

  openFollowersDialog(uid: string): void {
    this.soundService.openSound.play();
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
    this.soundService.openSound.play();
    this.dialog.open(FollowingsDialogComponent, {
      width: '400px',
      autoFocus: false,
      data: {
        authUid: uid,
        targetUid: this.targetUid,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
