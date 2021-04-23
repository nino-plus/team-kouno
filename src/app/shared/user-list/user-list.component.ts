import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { fade } from 'src/app/animations/animations';
import { InviteWithSender } from 'src/app/intefaces/invite';
import { LogWithUser } from 'src/app/interfaces/log';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { LogService } from 'src/app/services/log.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [fade],
})
export class UserListComponent implements OnInit {
  allUsers$: Observable<User[]> = this.userService.getPublicUsers();
  onlineUsers$: Observable<User[]> = this.userService.getOnlinePublicUsers();
  followings$: Observable<User[]>;
  user$: Observable<User> = this.authService.user$;
  uid: string;
  listSource: string = 'feed';
  invites$: Observable<InviteWithSender[]>;
  logs$: Observable<LogWithUser[]>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private meetingService: MeetingService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.user$
      .pipe(take(1))
      .toPromise()
      .then((user) => {
        (this.uid = user?.uid),
          (this.invites$ = this.meetingService.getInvites(this.uid));
      });
    this.user$.subscribe((user) => {
      this.uid = user?.uid;
      this.logs$ = this.logService.getLogsWithUser(this.uid);
    });
  }

  changeListSource(type: string): void {
    this.listSource = type;

    if (type == 'follow') {
      this.followings$ = this.userService.getFollowings(this.uid);
    }
  }
}
