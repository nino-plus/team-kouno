import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { StreamComponent } from '../event/stream/stream.component';
import { AgoraService } from '../services/agora.service';

@Injectable({
  providedIn: 'root',
})
export class RoomGuard implements CanDeactivate<StreamComponent> {
  constructor(private agoraService: AgoraService) {}
  canDeactivate(component: StreamComponent): Observable<boolean> | boolean {
    if (!component.isJoin) {
      return true;
    } else {
      this.agoraService.leaveAgoraChannel(component.eventId);
    }
    console.log(component.eventId);

    return false;
  }
}
