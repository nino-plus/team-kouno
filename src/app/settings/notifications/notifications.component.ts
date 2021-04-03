import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  requestPermission(uid: string) {
    this.messagingService.requestPermission(uid);
  }
}
