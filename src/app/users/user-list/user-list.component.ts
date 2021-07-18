import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { AuthService } from 'src/app/services/auth.service';
import { LogService } from 'src/app/services/log.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { SoundService } from 'src/app/services/sound.service';
import { UserService } from 'src/app/services/user.service';
import firebase from 'firebase/app';
import { User } from 'src/app/interfaces/user';
import { InviteWithSender } from 'src/app/intefaces/invite';
import { Log, LogWithUser } from 'src/app/interfaces/log';
import { shareReplay, skip, take } from 'rxjs/operators';
import firestore from 'firebase/app';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [fade],
})
export class UserListComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  allUsers: User[] = [];
  onlineUsers: User[] = [];
  followings: User[] = [];
  feeds: LogWithUser[] = [];
  user$: Observable<User> = this.authService.user$;
  uid: string;
  listSource: string = 'online';
  invites$: Observable<InviteWithSender[]>;
  logs$: Observable<LogWithUser[]>;

  isLoadingForAllUsers: boolean = true;
  isCompleteForAllUsers: boolean;
  isLoadingForOnlineUsers: boolean = true;
  isCompleteForOnlineUsers: boolean;
  isLoadingForFollowings: boolean = true;
  isCompleteForFollowings: boolean;
  isLoadingForFeeds: boolean = true;
  isCompleteForFeeds: boolean;
  lastUserDoc: firestore.firestore.QueryDocumentSnapshot<firestore.firestore.DocumentData>;
  lastOnlineUserDoc: firestore.firestore.QueryDocumentSnapshot<firestore.firestore.DocumentData>;
  lastFollowingDoc: firestore.firestore.QueryDocumentSnapshot<firestore.firestore.DocumentData>;
  lastFeedsDoc: firestore.firestore.QueryDocumentSnapshot<firestore.firestore.DocumentData>;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private meetingService: MeetingService,
    private logService: LogService,
    private soundService: SoundService,
    public uiService: UiService
  ) {}

  ngOnInit(): void {
    this.user$.pipe(shareReplay(1)).subscribe((user) => {
      this.uid = user?.uid;
      this.invites$ = this.meetingService.getInvites(this.uid);
    });

    if (this.invites$ === undefined) {
      return;
    }

    this.subscription.add(
      this.invites$.pipe(skip(1), shareReplay(1)).subscribe((invites) => {
        const lastInvite = invites.shift();
        if (lastInvite.createdAt.toMillis() >= this.dateNow.toMillis()) {
          this.soundService.callSound.play();
        }
      })
    );

    this.getOnlineUsers();
    this.getFeeds();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getAllUsers() {
    this.isLoadingForAllUsers = true;
    if (this.isCompleteForAllUsers) {
      this.isLoadingForAllUsers = false;
      return;
    }
    this.userService
      .getPublicUsers(this.lastUserDoc)
      .subscribe(({ userDatas, lastDoc }) => {
        if (userDatas) {
          if (!userDatas.length) {
            this.isCompleteForAllUsers = true;
            this.isLoadingForAllUsers = false;
            return;
          }
          this.lastUserDoc = lastDoc;
          const distinctUsers = userDatas.filter((doc) => doc.name !== null);
          distinctUsers.map((doc) => this.allUsers.push(doc));
          this.isLoadingForAllUsers = false;
        }
      });
  }

  getOnlineUsers() {
    this.isLoadingForOnlineUsers = true;
    if (this.isCompleteForOnlineUsers) {
      this.isLoadingForOnlineUsers = false;
      return;
    }
    this.userService
      .getOnlinePublicUsers(this.lastOnlineUserDoc)
      .pipe(take(1))
      .subscribe(({ userDatas, lastDoc }) => {
        if (userDatas) {
          if (!userDatas.length) {
            this.isCompleteForOnlineUsers = true;
            this.isLoadingForOnlineUsers = false;
            return;
          }
          this.lastOnlineUserDoc = lastDoc;
          const distinctUsers = userDatas.filter((doc) => doc.name !== null);
          distinctUsers.map((doc) => this.onlineUsers.push(doc));
          this.isLoadingForOnlineUsers = false;
        }
      });
  }

  getFollowings() {
    this.isLoadingForFollowings = true;
    if (this.isCompleteForFollowings) {
      this.isLoadingForFollowings = false;
      return;
    } else {
      this.userService
        .getFollowingsAndLastDoc(this.uid, this.lastFollowingDoc)
        .pipe(take(1))
        .subscribe(({ userDatas, lastDoc }) => {
          if (userDatas) {
            if (!userDatas.length) {
              this.isCompleteForFollowings = true;
              this.isLoadingForFollowings = false;
              return;
            }
            this.lastFollowingDoc = lastDoc;
            const distinctUsers = userDatas.filter((doc) => doc.name !== null);
            distinctUsers.map((doc) => this.followings.push(doc));
            this.isLoadingForFollowings = false;
          }
        });
    }
  }

  getFeeds() {
    this.isLoadingForFeeds = true;
    if (this.isCompleteForFeeds) {
      this.isLoadingForFeeds = false;
      return;
    } else {
      this.logService
        .getFeedsWithUser(this.uid, this.lastFeedsDoc)
        .pipe(take(1))
        .subscribe(({ logsData, lastDoc }) => {
          if (logsData) {
            if (!logsData.length) {
              this.isCompleteForFeeds = true;
              this.isLoadingForFeeds = false;
              return;
            }
            this.lastFeedsDoc = lastDoc;
            logsData.map((doc) => {
              this.feeds.push(doc);
            });
            this.isLoadingForFeeds = false;
          }
        });
    }
  }

  changeListSource(type: string): void {
    this.listSource = type;
    if (this.listSource === 'all') {
      this.getAllUsers();
    }
    if (this.listSource === 'follow') {
      this.getFollowings();
    }
    if (this.listSource === 'feed') {
      this.getFeeds();
    }
  }
}
