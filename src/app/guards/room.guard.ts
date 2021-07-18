import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { EventRoomComponent } from '../event/event-room/event-room.component';
import { EventService } from '../services/event.service';
import { Event } from 'src/app/interfaces/event';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { AgoraService } from '../services/agora.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoomGuard implements CanDeactivate<EventRoomComponent> {
  uid: string = this.authService.uid;

  constructor(
    private eventService: EventService,
    private router: Router,
    private agoraServicr: AgoraService,
    private authService: AuthService
  ) {}
  canDeactivate(component: EventRoomComponent): Observable<boolean> | boolean {
    if (component.isJoin) {
      const msg = 'イベントから退出してよろしいですか？';
      return confirm(msg);
    }
    return true;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const eventId = next.params.channelId;
    const now = moment();
    let paidUser: boolean;
    this.eventService
      .checkPaidUser(eventId, this.uid)
      .subscribe((result) => (paidUser = result));

    return this.eventService.getEvent(eventId).pipe(
      map((event: Event) => {
        const paid = event.price > 0;
        const startAt = moment.unix(event.startAt.seconds);
        const exitAt = moment.unix(event.exitAt.seconds);
        const overCapacity = event.headcountLimit >= event.participantCount;

        if (
          !now.isBetween(startAt, exitAt) ||
          (paid && !paidUser) ||
          overCapacity
        ) {
          this.agoraServicr.leaveAgoraChannel(eventId);
          this.router.navigateByUrl('/');
          return false;
        }
        return true;
      })
    );
  }
}
