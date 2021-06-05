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
import { LogWithUser } from 'src/app/interfaces/log';
import { shareReplay, skip, take } from 'rxjs/operators';

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
  followings$: Observable<User[]>;
  user$: Observable<User> = this.authService.user$;
  uid: string;
  listSource: string = 'online';
  invites$: Observable<InviteWithSender[]>;
  logs$: Observable<LogWithUser[]>;

  isLoadingForAllUsers: boolean = true;
  isCompleteForAllUsers: boolean;
  isLoadingForOnlineUsers: boolean = true;
  isCompleteForOnlineUsers: boolean;
  lastDoc: any;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private meetingService: MeetingService,
    private logService: LogService,
    private soundService: SoundService
  ) {
    this.getAllUsers();
    this.getOnlineUsers();
  }

  ngOnInit(): void {
    this.user$.pipe(shareReplay(1)).subscribe((user) => {
      this.uid = user?.uid;
      this.logs$ = this.logService.getLogsWithUser(this.uid);

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
      .getPublicUsers(this.lastDoc)
      .pipe(take(1))
      .subscribe(({ userDatas, lastDoc }) => {
        if (userDatas) {
          if (!userDatas.length) {
            this.isCompleteForAllUsers = true;
            this.isLoadingForAllUsers = false;
            return;
          }
          this.lastDoc = lastDoc;
          userDatas.map((doc) => this.allUsers.push(doc));
        } else {
          this.isCompleteForAllUsers = true;
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
      .getOnlinePublicUsers(this.lastDoc)
      .pipe(shareReplay(1))
      .subscribe(({ userDatas, lastDoc }) => {
        if (userDatas) {
          if (!userDatas.length) {
            this.isCompleteForOnlineUsers = true;
            this.isLoadingForOnlineUsers = false;
            return;
          }
          this.lastDoc = lastDoc;
          userDatas.map((doc) => this.onlineUsers.push(doc));
        } else {
          this.isCompleteForOnlineUsers = true;
          this.isLoadingForOnlineUsers = false;
        }
      });
  }

  changeListSource(type: string): void {
    this.listSource = type;

    if (type == 'follow') {
      this.followings$ = this.userService.getFollowings(this.uid);
    }
  }
}
