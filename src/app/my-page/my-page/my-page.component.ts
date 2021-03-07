import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss'],
})
export class MyPageComponent implements OnInit {
  dateNow: firebase.default.firestore.Timestamp = firebase.default.firestore.Timestamp.now();
  user$: Observable<User> = this.route.paramMap.pipe(
    switchMap((params) => {
      return this.userService.getUserData(params.get('uid'));
    })
  );
  user: User;
  currentUser$: Observable<User> = this.authService.user$;
  currentUserUid: string;
  reservedEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getFutureReservedEvents(user.uid);
    })
  );
  pastEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getPastReservedEvents(user.uid);
    })
  );
  ownerEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      return this.eventService.getOwnerEvents(user.uid);
    })
  );
  uid: string;
  type;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.currentUser$.subscribe((user) => {
      this.currentUserUid = user.uid;
    });
  }

  ngOnInit(): void {}
}
