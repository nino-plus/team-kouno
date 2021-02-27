import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-event-room',
  templateUrl: './event-room.component.html',
  styleUrls: ['./event-room.component.scss'],
})
export class EventRoomComponent implements OnInit {
  eventId: string;
  user$: Observable<User> = this.authService.user$;
  uid: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.params.channelId;
    this.uid = this.route.snapshot.params.uid;
  }
}
