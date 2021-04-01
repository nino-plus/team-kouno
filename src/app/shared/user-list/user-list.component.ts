import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import * as firebase from 'firebase';
import { MessagingService } from 'src/app/services/messaging.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users$ = this.userService.getUsers();
  messaging = firebase.default.messaging();
  title = 'push-notification';
  message: any;
  user$: Observable<User> = this.authService.user$;
  uid: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private meetingService: MeetingService,
    private MessagingService: MessagingService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.uid = user.uid;
    });
    this.MessagingService.requestPermission(this.uid);
    this.MessagingService.receiveMessage();
    this.message = this.MessagingService.currentMessage;
  }

  async call(uid: string) {
    const roomId = this.meetingService.createRoomId();
    this.meetingService.createInvite(uid, roomId, this.authService.uid);

    this.router.navigate(['meeting', roomId]);
  }
}
