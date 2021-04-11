import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { EventRoomComponent } from '../event/event-room/event-room.component';
import { AgoraService } from '../services/agora.service';

@Injectable({
  providedIn: 'root',
})
export class RoomGuard implements CanDeactivate<EventRoomComponent> {
  constructor(private agoraService: AgoraService) {}
  canDeactivate(component: EventRoomComponent): Observable<boolean> | boolean {
    if (!component.isJoin) {
      return true;
    } else {
      this.agoraService.leaveAgoraChannel(component.eventId);
    }
    console.log(component.eventId);

    return false;
  }
}
