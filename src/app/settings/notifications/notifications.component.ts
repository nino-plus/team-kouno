import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Token } from 'src/app/interfaces/token';
import { AuthService } from 'src/app/services/auth.service';
import { MessagingService } from 'src/app/services/messaging.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  user$: Observable<any> = this.authService.user$;
  uid: string;
  tokens$: Observable<Token[]>;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.tokens$ = this.messagingService.getTokens(user.uid);
    });
  }

  requestPermission(uid: string) {
    this.messagingService.requestPermission(uid);
  }

  rejectPermission(uid: string) {
    this.messagingService.deleteToken(uid);
  }
}
