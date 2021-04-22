import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { EventDetailDialogComponent } from 'src/app/shared/event-detail-dialog/event-detail-dialog.component';

const colors: any = {
  main: {
    primary: '#1bcbe0',
    secondary: '#FAE3E3',
  },
  pink: {
    primary: '#F891A8',
    secondary: '#D1E8FF',
  },
  orange: {
    primary: '#ed9309',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-event-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss'],
})
export class EventCalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  reserveEvents$: Observable<Event[]> = this.authService.user$.pipe(
    switchMap((user) => {
      if (user) {
        return this.eventService.getReservedEvents(user.uid);
      } else {
        return of(null);
      }
    })
  );

  calendarEventLists = [];

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  CalendarView = CalendarView;

  activeDayIsOpen: boolean;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = this.calendarEventLists;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reserveEvents$.pipe(take(1)).subscribe((events) => {
      if (events) {
        events.forEach((event) => {
          this.calendarEventLists.push({
            id: event?.eventId,
            start: event?.startAt.toDate(),
            end: event?.exitAt ? event.exitAt.toDate() : '',
            title: event?.name,
            color: colors.orange,
            actions: this.actions,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },
            draggable: true,
          });
        });
      }
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.router.navigateByUrl(`/event/${event.id}`);
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }
}
