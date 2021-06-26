import { Component, Input, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  animations: [fade],
})
export class UserCardComponent implements OnInit {
  @Input() targetUser: User;
  tokens: string[] = [];
  currentUser$: Observable<User> = this.authService.user$;

  constructor(
    private messagingService: MessagingService,
    private fns: AngularFireFunctions,
    private meetingService: MeetingService,
    private authService: AuthService,
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

  async enterWaitingRoom(targetUid: string): Promise<void> {
    const roomId = await this.meetingService.createEmptyRoom(
      this.authService.uid
    );
    this.router.navigate(['waiting', roomId, { targetUid: targetUid }]);
  }
}
