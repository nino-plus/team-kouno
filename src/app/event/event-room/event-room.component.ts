import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EventWithOwner } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-event-room',
  templateUrl: './event-room.component.html',
  styleUrls: ['./event-room.component.scss'],
})
export class EventRoomComponent implements OnInit {
  eventId: string;
  user$: Observable<User> = this.authService.user$;
  eventWithOwner$: Observable<EventWithOwner>;
  uid: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.params.channelId;
    this.uid = this.route.snapshot.params.uid;
    this.eventWithOwner$ = this.eventService.getEventWithOwner(this.eventId);
  }
}
