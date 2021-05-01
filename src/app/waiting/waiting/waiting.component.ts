import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
})
export class WaitingComponent implements OnInit {
  tokens: string[] = [];
  currentUser$: Observable<User> = this.authService.user$;
  uid: string = this.route.snapshot.paramMap.get('uid');
  user$: Observable<User> = this.userService.getUserData(this.uid);

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private messagingService: MessagingService,
    private fns: AngularFireFunctions,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

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

  async call(currentUser: User): Promise<void> {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    this.meetingService.createInvite(this.uid, roomId, this.authService.uid);
    const tokens$ = this.messagingService.getTokens(this.uid);
    tokens$.pipe(take(1)).subscribe((tokens) => {
      tokens?.map((token) => this.tokens.push(token?.token));
      this.sendPushMessage(this.tokens, currentUser, roomId);
    });
  }
}
