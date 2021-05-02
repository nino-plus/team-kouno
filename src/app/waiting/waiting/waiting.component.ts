import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
  animations: [fade],
})
export class WaitingComponent implements OnInit {
  tokens: string[] = [];
  currentUser$: Observable<User> = this.authService.user$;
  uid: string = this.route.snapshot.paramMap.get('uid');
  user$: Observable<User> = this.userService.getUserData(this.uid);

  readonly MESSAGE_MAX_LENGTH = 200;
  form = this.fb.group({
    message: [
      'こんにちは！',
      [Validators.required, Validators.maxLength(this.MESSAGE_MAX_LENGTH)],
    ],
  });

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private messagingService: MessagingService,
    private fns: AngularFireFunctions,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
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
    const formData = this.form.value;
    const message = formData.message;
    const roomId = this.route.snapshot.paramMap.get('roomId');
    this.meetingService.createInvite(
      this.uid,
      roomId,
      this.authService.uid,
      message
    );
    const tokens$ = this.messagingService.getTokens(this.uid);
    tokens$.pipe(take(1)).subscribe((tokens) => {
      tokens?.map((token) => this.tokens.push(token?.token));
      this.sendPushMessage(this.tokens, currentUser, roomId);
    });

    this.router.navigate(['meeting', roomId]);
  }
}
