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
  tokens$: Observable<Token[]> = this.user$.pipe(
    switchMap((user) => {
      return this.messagingService.getTokens(user.uid);
    })
  );
  tokens: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private meetingService: MeetingService,
    private messagingService: MessagingService,
    private fns: AngularFireFunctions,
    private msg: AngularFireMessaging
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  send() {
    this.tokens$.pipe(take(1)).subscribe((tokens) => {
      tokens.map((token) => this.tokens.push(token.token));
      const callable = this.fns.httpsCallable('sendPushMessage');
      return callable(this.tokens)
        .toPromise()
        .then(() => {
          this.messagingService.receiveMessage();
        });
    });
  }

  async call(uid: string) {
    const roomId = this.meetingService.createRoomId();
    this.meetingService.createInvite(uid, roomId, this.authService.uid);

    this.router.navigate(['meeting', roomId]);
  }
}
