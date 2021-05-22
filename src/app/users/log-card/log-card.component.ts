import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { Event } from 'src/app/interfaces/event';
import { LogWithUser } from 'src/app/interfaces/log';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-log-card',
  templateUrl: './log-card.component.html',
  styleUrls: ['./log-card.component.scss'],
  animations: [fade],
})
export class LogCardComponent implements OnInit {
  @Input() log: LogWithUser;
  event$: Observable<Event>;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.event$ = this.eventService.getEvent(this.log.logId);
  }

  navigateProfile($event: any): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.router.navigateByUrl('/' + this.log.uid);
  }

  navigateEvent(eventId: string): void {
    this.router.navigateByUrl('/event/' + eventId);
  }
}
