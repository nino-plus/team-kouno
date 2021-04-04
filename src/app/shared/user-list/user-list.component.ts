import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import * as firebase from 'firebase';
import { MessagingService } from 'src/app/services/messaging.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AngularFireFunctions } from '@angular/fire/functions';
import { switchMap, take } from 'rxjs/operators';
import { Token } from 'src/app/interfaces/token';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { fade } from 'src/app/animations/animations';
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
  listSource: string = 'all';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  changeListSource(type: string): void {
    this.listSource = type;

    if (type == 'follow') {
      this.followings$ = this.userService.getFollowings(this.uid);
    }
  }
}
