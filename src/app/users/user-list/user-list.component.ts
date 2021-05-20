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
import { shareReplay, skip } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [fade],
})
export class UserListComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  allUsers$: Observable<User[]> = this.userService.getPublicUsers();
  onlineUsers$: Observable<User[]> = this.userService.getOnlinePublicUsers();
  followings$: Observable<User[]>;
  user$: Observable<User> = this.authService.user$;
  uid: string;
  listSource: string = 'online';
  invites$: Observable<InviteWithSender[]>;
  logs$: Observable<LogWithUser[]>;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private meetingService: MeetingService,
    private logService: LogService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.user$.pipe(shareReplay(1)).subscribe((user) => {
      this.uid = user.uid;
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

  changeListSource(type: string): void {
    this.listSource = type;

    if (type == 'follow') {
      this.followings$ = this.userService.getFollowings(this.uid);
    }
  }
}
